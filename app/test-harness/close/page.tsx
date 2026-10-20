import { PageClose } from "@/components/site/PageClose";
import { guardHarness } from "../analytics/guard";

/**
 * Test-only: the three forms of PageClose with synthetic lines, so the block
 * is proven before any page places it (SITE-6). Its path is a literal in this
 * page and its spec. It answers 404 on a production deployment.
 */
export default function CloseHarness() {
  guardHarness();
  return (
    <main>
      <h1 className="sr-only">Close harness</h1>
      <div data-fixture="call">
        <PageClose
          line="Fixture closing line"
          availability="fixture availability"
          surface="case-study"
          slug="conscious-connections"
          resume
        />
      </div>
      <div data-fixture="no-resume">
        <PageClose
          line="Fixture closing line, no résumé"
          availability="fixture availability"
          surface="capabilities"
          lineSize="h3"
        />
      </div>
      <div data-fixture="note">
        <PageClose
          line="Fixture closing line, note first"
          availability="fixture availability"
          surface="services"
          form="note"
          noteLabel="Send a note"
        />
      </div>
    </main>
  );
}
