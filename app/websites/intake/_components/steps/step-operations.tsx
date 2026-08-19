"use client";

import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";

/**
 * The single highest-value control in this form. On the Clean Coast build,
 * the site promised the business brought its own water and power; it did not,
 * and the claim reached twenty-odd places across five live pages. A checkbox
 * list is what makes that answerable in four seconds — an open text box gets
 * "the usual" and the truth never surfaces until the verification call.
 *
 * "Nothing" is exclusive: choosing it clears the rest and vice versa. If a
 * client really does bring everything, that is worth reading as a deliberate
 * answer rather than an empty field.
 */
const CUSTOMER_PROVIDES = [
  { value: "power", label: "Power or electricity" },
  { value: "water", label: "Water" },
  { value: "parking", label: "A parking space" },
  { value: "indoorSpace", label: "Indoor space" },
  { value: "access", label: "Access or keys" },
  { value: "someonePresent", label: "Someone there while you work" },
  { value: "nothing", label: "Nothing — you bring it all" },
] as const;

const DAYS = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
] as const;

const BOOKING_CHANNELS = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
  { value: "socialDm", label: "Social media DM" },
  { value: "email", label: "Email" },
  { value: "websiteForm", label: "Website form" },
  { value: "bookingApp", label: "A booking app" },
] as const;

/** Step 3 — How you work. */
export function StepOperations({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "operations", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="customerProvides"
        label="What does the customer need to provide?"
        options={CUSTOMER_PROVIDES}
        multiple
        exclusiveValue="nothing"
      />
      <TextAnswer
        form={form}
        name="customerProvidesOther"
        label="Anything else they need to have ready"
      />

      <LongAnswer form={form} name="whatYouBring" label="What do you bring to a job?" />

      <LongAnswer
        form={form}
        name="whatMustBeTrue"
        label="What has to be true for you to do the job?"
        help="The things you check before saying yes."
      />
      <LongAnswer
        form={form}
        name="whatMakesYouDecline"
        label="What makes you turn a job down?"
      />

      <LongAnswer form={form} name="areasCovered" label="Areas you cover" />
      <LongAnswer
        form={form}
        name="areasAvoided"
        label="Areas you'd rather avoid"
        help="Even if you technically could."
      />
      <TextAnswer form={form} name="furthestTravel" label="Furthest you'll travel" />

      <ChoiceAnswer
        form={form}
        name="daysWorked"
        label="Days you work"
        options={DAYS}
        multiple
      />
      <TextAnswer form={form} name="typicalHours" label="Typical hours" />
      <TextAnswer form={form} name="jobsPerDay" label="Jobs per day, realistically" />
      <TextAnswer form={form} name="howFarAhead" label="How far ahead you take bookings" />
      <TextAnswer form={form} name="shortestNotice" label="Shortest notice you'll accept" />

      <LongAnswer form={form} name="badWeather" label="Bad weather or off-season" />
      <TextAnswer form={form} name="replySpeed" label="How fast you reply to enquiries" />

      <ChoiceAnswer
        form={form}
        name="howCustomersBook"
        label="How customers book you now"
        options={BOOKING_CHANNELS}
        multiple
      />
      <TextAnswer
        form={form}
        name="howCustomersBookOther"
        label="Any other way they reach you"
      />
    </>
  );
}
