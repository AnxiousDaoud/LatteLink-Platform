import Link from "next/link";
import { getInternalLocationReadiness, listInternalLocations } from "@/lib/internal-api";

type LaunchState = "healthy" | "warning" | "critical";

function getLaunchState(input: { ready: boolean; passedCount: number; totalCount: number }): LaunchState {
  if (input.ready) {
    return "healthy";
  }

  return input.passedCount >= Math.max(input.totalCount - 2, 0) ? "warning" : "critical";
}

function getLaunchLabel(state: LaunchState) {
  switch (state) {
    case "healthy":
      return "Ready";
    case "warning":
      return "Attention";
    default:
      return "Blocked";
  }
}

function getActivityFeed(rows: Array<{
  brandName: string;
  locationId: string;
  failedChecks: string[];
}>) {
  const items = rows.flatMap((row) => {
    return row.failedChecks.slice(0, 3).map((label) => ({
        severity: "danger" as const,
        label: `${row.brandName}: ${label}`,
        detail: `${row.locationId} needs this launch gate completed before pilot handoff.`
      }));
  });

  if (items.length > 0) {
    return items.slice(0, 8);
  }

  return [
    {
      severity: "info" as const,
      label: "All visible clients pass automated launch checks",
      detail: "Confirm manual test orders before the final go-live handoff."
    }
  ];
}

export default async function DashboardPage() {
  const locations = (await listInternalLocations()).locations;
  const readinessSummaries = await Promise.all(
    locations.map(async (location) => ({
      locationId: location.locationId,
      readiness: await getInternalLocationReadiness(location.locationId)
    }))
  );

  const readinessByLocationId = new Map(readinessSummaries.map((summary) => [summary.locationId, summary.readiness]));

  const rows = locations.map((location) => {
    const readiness = readinessByLocationId.get(location.locationId);
    if (!readiness) {
      throw new Error(`Missing readiness summary for ${location.locationId}`);
    }
    const launchState = getLaunchState(readiness);

    return {
      location,
      readiness,
      launchState
    };
  });

  const readyCount = rows.filter((row) => row.launchState === "healthy").length;
  const warningCount = rows.filter((row) => row.launchState === "warning").length;
  const criticalCount = rows.filter((row) => row.launchState === "critical").length;
  const ownerAccessCount = rows.filter((row) =>
    row.readiness.checks.find((check) => check.id === "owner_provisioned")?.passed
  ).length;
  const activityFeed = getActivityFeed(
    rows.map((row) => ({
      brandName: row.location.brandName,
      locationId: row.location.locationId,
      failedChecks: row.readiness.checks.filter((check) => !check.passed && !check.manual).map((check) => check.label)
    }))
  );

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h3>Platform overview</h3>
          <p>Start from the launch baseline, then drill into the clients that still need operator access or capability work.</p>
        </div>
        <div className="page-tools">
          <Link href="/clients" className="secondary-button">
            View Clients
          </Link>
          <Link href="/clients/new" className="primary-button">
            Create Client
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="stat-card">
          <span className="eyebrow">Visible Clients</span>
          <strong>{locations.length}</strong>
          <p>Internal locations currently exposed by the bootstrap APIs.</p>
        </article>
        <article className="stat-card">
          <span className="eyebrow">Launch Ready</span>
          <strong>{readyCount}</strong>
          <p>Clients passing all automated go-live checks.</p>
          <span className={readyCount === locations.length ? "metric-delta is-positive" : "metric-delta"}>
            {locations.length === 0 ? "No clients yet" : `${readyCount} of ${locations.length} ready`}
          </span>
        </article>
        <article className="stat-card">
          <span className="eyebrow">Needs Attention</span>
          <strong>{warningCount + criticalCount}</strong>
          <p>Locations that still have at least one launch-critical gap.</p>
          <span className={(criticalCount > 0 ? "metric-delta is-danger" : "metric-delta is-warning")}>
            {criticalCount > 0 ? `${criticalCount} blocked` : `${warningCount} in review`}
          </span>
        </article>
        <article className="stat-card">
          <span className="eyebrow">Owner Access</span>
          <strong>{ownerAccessCount}</strong>
          <p>Locations with active owner access provisioned.</p>
        </article>
      </div>

      <div className="dashboard-layout">
        <section className="panel table-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Readiness</span>
              <h4>Client launch state</h4>
            </div>
            <Link href="/launch-readiness" className="table-link">
              Open readiness board
            </Link>
          </div>

          {rows.length === 0 ? (
            <div className="empty-state">
              <h4>No client locations yet.</h4>
              <p>Create the first client to populate the launch dashboard.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Market</th>
                  <th>Readiness</th>
                  <th>Menu</th>
                  <th>Payment</th>
                  <th>Launch State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.location.locationId}>
                    <td>
                      <strong>{row.location.brandName}</strong>
                      <span>{row.location.locationName}</span>
                    </td>
                    <td>{row.location.marketLabel}</td>
                    <td>{row.readiness.passedCount}/{row.readiness.totalCount}</td>
                    <td>
                      <span className={row.location.capabilities.menu.source === "platform_managed" ? "menu-badge" : "menu-badge is-external"}>
                        {row.location.capabilities.menu.source === "platform_managed" ? "Platform" : "External"}
                      </span>
                    </td>
                    <td>{row.readiness.checks.find((check) => check.id === "stripe_onboarded")?.passed ? "Ready" : "Needs setup"}</td>
                    <td>
                      <div className={`status-badge is-${row.launchState}`}>
                        {getLaunchLabel(row.launchState)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Activity</span>
              <h4>Operational notes</h4>
            </div>
          </div>

          <div className="activity-feed">
            {activityFeed.map((item) => (
              <div key={`${item.label}-${item.detail}`} className="feed-row">
                <span className={`feed-dot is-${item.severity}`} />
                <div>
                  <strong>{item.label}</strong>
                  <p className="subtle-copy">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
