import Link from "next/link";
import { createClientAction } from "@/app/actions";

type NewClientPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewClientPage({ searchParams }: NewClientPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">New Client</span>
          <h3>Create a client</h3>
          <p>Set up the location, launch capabilities, and owner access in one flow.</p>
        </div>
        <Link href="/clients" className="secondary-button">
          Back to Clients
        </Link>
      </div>

      <form action={createClientAction} className="split-layout split-layout--wide">
        <section className="panel stack-form">
          <div className="wizard-steps" aria-label="Create client steps">
            <div className="wizard-step is-active">
              <span className="wizard-step-index">1</span>
              Client identity
            </div>
            <div className="wizard-step is-active">
              <span className="wizard-step-index">2</span>
              Location
            </div>
            <div className="wizard-step is-active">
              <span className="wizard-step-index">3</span>
              Owner invite
            </div>
          </div>

          {error ? <p className="inline-message inline-message-error">{error}</p> : null}

          <div className="form-card">
            <div className="section-copy">
              <span className="eyebrow">Step 1</span>
              <h4>Client identity</h4>
              <p>Define the business identity that shows up across the internal console, mobile app configuration, and dashboard handoff. Internal IDs are generated after creation.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Client name</span>
                <input name="clientName" placeholder="Northside Coffee" required />
              </label>
              <label className="field">
                <span>Market</span>
                <input name="marketLabel" placeholder="Detroit, MI" required />
              </label>
            </div>
          </div>

          <div className="form-card">
            <div className="section-copy">
              <span className="eyebrow">Step 2</span>
              <h4>Location setup</h4>
              <p>Capture the first store label the owner will recognize during dashboard setup. Backend tenant, brand, and location IDs are generated when the shell is created.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Location name</span>
                <input name="locationName" placeholder="Northside Flagship" required />
              </label>
            </div>
          </div>

          <div className="form-card">
            <div className="section-copy">
              <span className="eyebrow">Step 3</span>
              <h4>Owner access</h4>
              <p>Send the owner a one-time dashboard invite. The owner sets their own password from the client dashboard.</p>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Owner name</span>
                <input name="ownerDisplayName" placeholder="Owner Name" required />
              </label>
              <label className="field">
                <span>Owner email</span>
                <input name="ownerEmail" type="email" placeholder="owner@northside.com" required />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Link href="/clients" className="secondary-button">
              Cancel
            </Link>
            <button type="submit" className="primary-button">
              Create Client
            </button>
          </div>
        </section>

        <aside className="sidebar-stack sticky-sidebar">
          <section className="panel">
            <div className="section-copy">
              <span className="eyebrow">What This Does</span>
              <h4>Provision the first client lane</h4>
              <p>This flow creates the tenant shell, generates backend identifiers, and sends the first owner invite.</p>
            </div>
            <div className="step-list">
              <div className="step-item">
                <span className="step-item-index">1</span>
                <div className="step-item-copy">
                  <strong>Create the tenant shell</strong>
                  <p>Generate tenant, brand, and location identifiers from the backend.</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-item-index">2</span>
                <div className="step-item-copy">
                  <strong>Send owner invite</strong>
                  <p>Create a pending owner account and deliver the one-time setup link.</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-item-index">3</span>
                <div className="step-item-copy">
                  <strong>Continue setup in dashboard</strong>
                  <p>The client completes business details, operations, payments, and launch review from their dashboard.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="section-copy">
              <span className="eyebrow">Generated IDs</span>
              <h4>After creation</h4>
            </div>
            <div className="tag-list">
              <span className="tag is-success">Tenant ID</span>
              <span className="tag is-success">Brand ID</span>
              <span className="tag is-success">Location ID</span>
            </div>
            <div className="callout is-warning">
              <strong>Do not ask clients for internal IDs</strong>
              <p>Use display names during intake. Generated identifiers appear on the client detail page after creation.</p>
            </div>
          </section>
        </aside>
      </form>
    </section>
  );
}
