import { createEngagement } from "@/server/services/engagement";
import { saveStepAnswers } from "@/server/services/submission";
async function main() {
  const { token } = await createEngagement({
    businessName: "Sample Filmmaker", contactName: "Sample Filmmaker",
    contactEmail: `pay-${Date.now()}@example.test`, currency: "cad",
    depositRequired: true, track: "showcase",
  });
  await saveStepAnswers(token, "about", { disciplines: ["film"], siteKinds: ["portfolio"] });
  console.log(token);
}
main();
