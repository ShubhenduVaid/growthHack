import { buildQaHref, getQaFixtures, type QaFixtureKey } from "../lib/qa";

type QaPanelProps = {
  activeFixtureKey: QaFixtureKey | null;
  pathname: string;
};

const flowFixtures: QaFixtureKey[] = ["empty", "resume", "ready", "submitted"];
const recoveryFixtures: QaFixtureKey[] = ["invalid-storage", "malformed-storage"];

export const QaPanel = ({ activeFixtureKey, pathname }: QaPanelProps) => {
  const fixtures = getQaFixtures();
  const activeFixture = fixtures.find((fixture) => fixture.key === activeFixtureKey) ?? null;

  return (
    <aside className="qa-panel" aria-labelledby="qa-panel-title" data-testid="qa-panel">
      <div className="qa-panel__header">
        <div>
          <p className="qa-panel__eyebrow">QA Mode</p>
          <h2 id="qa-panel-title">Smoke coverage helpers</h2>
        </div>
        <a className="qa-panel__exit" href={pathname}>
          Exit QA Mode
        </a>
      </div>

      <p className="qa-panel__status">
        {activeFixture
          ? `${activeFixture.label} fixture is active. Reload with plain QA mode to inspect saved progress without re-seeding storage.`
          : "QA mode is active. Use a fixture below to seed storage or jump directly into a smoke-path checkpoint."}
      </p>

      <div className="qa-panel__group">
        <h3>Flow fixtures</h3>
        <div className="qa-panel__actions">
          {flowFixtures.map((fixtureKey) => {
            const fixture = fixtures.find((item) => item.key === fixtureKey);

            if (!fixture) {
              return null;
            }

            return (
              <a
                key={fixture.key}
                className={`qa-link ${fixture.key === activeFixtureKey ? "qa-link--active" : ""}`}
                href={buildQaHref(pathname, fixture.key)}
                data-testid={`qa-fixture-${fixture.key}`}
              >
                <strong>{fixture.label}</strong>
                <span>{fixture.description}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="qa-panel__group">
        <h3>Recovery fixtures</h3>
        <div className="qa-panel__actions">
          {recoveryFixtures.map((fixtureKey) => {
            const fixture = fixtures.find((item) => item.key === fixtureKey);

            if (!fixture) {
              return null;
            }

            return (
              <a
                key={fixture.key}
                className={`qa-link ${fixture.key === activeFixtureKey ? "qa-link--active" : ""}`}
                href={buildQaHref(pathname, fixture.key)}
                data-testid={`qa-fixture-${fixture.key}`}
              >
                <strong>{fixture.label}</strong>
                <span>{fixture.description}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="qa-panel__group">
        <h3>Persistence helpers</h3>
        <div className="qa-panel__actions">
          <a className="qa-link" href={buildQaHref(pathname)} data-testid="qa-mode-current-storage">
            <strong>Inspect Current Storage</strong>
            <span>Stay in QA mode without mutating storage or resetting the current saved answers.</span>
          </a>
          <a className="qa-link" href={buildQaHref(pathname, "empty")} data-testid="qa-mode-reset-storage">
            <strong>Reset Saved Answers</strong>
            <span>Clear local storage and reopen the cold-start path without editing browser storage by hand.</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
