import Link from "next/link";
import { notFound } from "next/navigation";
import { resendOwnerInviteAction } from "@/app/actions";
import { getInternalLocation, getInternalLocationOwner, InternalApiError } from "@/lib/internal-api";

type ClientOwnerPageProps = {
  params: Promise<{ locationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientOwnerPage({ params, searchParams }: ClientOwnerPageProps) {
  const { locationId } = await params;
  const query = await searchParams;
  const invited = typeof query.invited === "string" ? query.invited : undefined;
  const created = typeof query.created === "string" ? query.created : undefined;
  const error = typeof query.error === "string" ? query.error : undefined;

  try {
    const [location, ownerSummary] = await Promise.all([
      getInternalLocation(locationId),
      getInternalLocationOwner(locationId)
    ]);
    const hasOwner = Boolean(ownerSummary.owner);

    return (
      <section className="page-stack">
        <div className="page-header">
          <div>
            <span className="eyebrow">Owner Access</span>
            <h3>{location.brandName}</h3>
            <p>Provision or rotate the first client dashboard owner without touching the database manually.</p>
          </div>
          <div className="page-tools">
            <span className={hasOwner ? "status-badge is-healthy" : "status-badge is-warning"}>
              {ownerSummary.owner?.active ? "Invite accepted" : hasOwner ? "Invite pending" : "Owner missing"}
            </span>
            <Link href={`/clients/${locationId}`} className="secondary-button">
              Back to Client
            </Link>
          </div>
        </div>

        <div className="stat-grid">
          <article className="stat-card">
            <span className="eyebrow">Owner Status</span>
            <strong>{hasOwner ? (ownerSummary.owner?.active ? "Accepted" : "Pending invite") : "Missing"}</strong>
            <p>{hasOwner ? ownerSummary.owner?.email : "Send the first owner invite before dashboard handoff."}</p>
          </article>
          <article className="stat-card">
            <span className="eyebrow">Role</span>
            <strong>{ownerSummary.owner?.role ?? "Not assigned"}</strong>
            <p>The first client dashboard account should normally land with owner-level access.</p>
          </article>
          <article className="stat-card">
            <span className="eyebrow">Location</span>
            <strong>{location.locationName}</strong>
            <p>{location.marketLabel}</p>
          </article>
          <article className="stat-card">
            <span className="eyebrow">Dashboard</span>
            <strong>{location.capabilities.operations.dashboardEnabled ? "Enabled" : "Disabled"}</strong>
            <p>Owner access matters only if the client dashboard is enabled for this store.</p>
          </article>
        </div>

        <div className="split-layout">
          <section className="panel stack-form">
            {created ? <p className="inline-message inline-message-success">Client shell created.</p> : null}
            {invited ? <p className="inline-message inline-message-success">Owner invite sent.</p> : null}
            {error ? <p className="inline-message inline-message-error">{error}</p> : null}

            {ownerSummary.owner ? (
              <div className={ownerSummary.owner.active ? "callout is-success" : "callout is-warning"}>
                <strong>Current owner: {ownerSummary.owner.displayName}</strong>
                <p>
                  {ownerSummary.owner.email} · {ownerSummary.owner.active ? "Invite accepted" : "Invite pending"}
                </p>
              </div>
            ) : (
              <p className="inline-message inline-message-warning">No owner exists yet for this client.</p>
            )}

            <form action={resendOwnerInviteAction} className="stack-form">
              <input type="hidden" name="locationId" value={location.locationId} />
              <div className="form-card">
                <div className="section-copy">
                  <span className="eyebrow">Owner Identity</span>
                  <h4>Dashboard invite</h4>
                  <p>Send or resend the one-time setup link. The owner sets their own password from the client dashboard.</p>
                </div>
                <div className="field-grid">
                  <label className="field">
                    <span>Display name</span>
                    <input name="displayName" defaultValue={ownerSummary.owner?.displayName ?? ""} required />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input name="email" type="email" defaultValue={ownerSummary.owner?.email ?? ""} required />
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Link href={`/clients/${locationId}`} className="secondary-button">
                  Cancel
                </Link>
                <button type="submit" className="primary-button">
                  {ownerSummary.owner ? "Resend Invite" : "Send Invite"}
                </button>
              </div>
            </form>
          </section>

          <aside className="sidebar-stack sticky-sidebar">
            <section className="panel">
              <div className="section-copy">
                <span className="eyebrow">Handoff checklist</span>
                <h4>Before you send access</h4>
              </div>
              <div className="mini-list">
                <div className="mini-list-item">
                  <span className="step-item-index">1</span>
                  <div className="mini-list-copy">
                    <strong>Confirm dashboard availability</strong>
                    <p>The store should have the client dashboard enabled before the owner invite is sent.</p>
                  </div>
                </div>
                <div className="mini-list-item">
                  <span className="step-item-index">2</span>
                  <div className="mini-list-copy">
                    <strong>Use the right email</strong>
                    <p>Google sign-in and future reset flows will rely on the verified email attached to this owner.</p>
                  </div>
                </div>
                <div className="mini-list-item">
                  <span className="step-item-index">3</span>
                  <div className="mini-list-copy">
                    <strong>Track invite acceptance</strong>
                    <p>A pending owner means the invite was sent but the owner has not set their password yet.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={location.capabilities.operations.dashboardEnabled ? "panel" : "panel"}>
              <div className={location.capabilities.operations.dashboardEnabled ? "callout is-success" : "callout is-warning"}>
                <strong>
                  {location.capabilities.operations.dashboardEnabled
                    ? "Dashboard handoff is allowed for this client"
                    : "Dashboard handoff is currently disabled"}
                </strong>
                <p>
                  {location.capabilities.operations.dashboardEnabled
                    ? "The owner can sign in after accepting the invite and setting a password."
                    : "Enable the client dashboard in capabilities before sending the owner invite to the client team."}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof InternalApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
