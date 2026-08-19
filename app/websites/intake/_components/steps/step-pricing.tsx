"use client";

import type { AddOnAnswer, ServiceAnswer } from "@/lib/validators/intake";
import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";
import { Field } from "../field";
import { RepeatableBlock } from "../repeatable-block";
import { TextArea, TextField } from "../text-field";

const EXTRA_CHARGES = [
  { value: "travel", label: "Travel or distance" },
  { value: "size", label: "Size" },
  { value: "afterHours", label: "After hours" },
  { value: "rush", label: "Rush" },
  { value: "none", label: "None of these" },
] as const;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "etransfer", label: "E-transfer" },
  { value: "card", label: "Card" },
  { value: "invoice", label: "Invoice" },
] as const;

const WHEN_THEY_PAY = [
  { value: "onCompletion", label: "On completion" },
  { value: "depositUpFront", label: "Deposit up front" },
  { value: "fullUpFront", label: "Full payment up front" },
  { value: "varies", label: "It varies" },
] as const;

function asServices(value: unknown): ServiceAnswer[] {
  return Array.isArray(value) ? (value as ServiceAnswer[]) : [];
}

function asAddOns(value: unknown): AddOnAnswer[] {
  return Array.isArray(value) ? (value as AddOnAnswer[]) : [];
}

/**
 * Step 2 — What you offer and what you charge.
 *
 * Prices stay free text. A number input would force "149" out of someone whose
 * real answer is "from $80/hr, more if it's a double garage" — and the real
 * answer is the one that stops the site quoting a price the client does not
 * honour.
 */
export function StepPricing({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "pricing", initial });
  useReportSaveState(form.state, form.retry);

  const services = asServices(form.values.services);
  const addOns = asAddOns(form.values.addOns);

  return (
    <>
      <Field id="f-services" label="Your services">
        <RepeatableBlock<ServiceAnswer>
          items={services}
          onChange={(next) => form.setValue("services", next)}
          emptyItem={() => ({})}
          addLabel="Add another service"
          renderItem={(service, index, update) => (
            <div className="space-y-3">
              <TextField
                id={`service-${index}-name`}
                aria-label="Service name"
                placeholder="Service name"
                value={service.name ?? ""}
                onChange={(e) => update({ ...service, name: e.target.value })}
                onBlur={form.flush}
              />
              <TextField
                id={`service-${index}-price`}
                aria-label="Price"
                placeholder="Price — $149, or from $80/hr"
                value={service.price ?? ""}
                onChange={(e) => update({ ...service, price: e.target.value })}
                onBlur={form.flush}
              />
              <TextArea
                id={`service-${index}-included`}
                aria-label="What's included"
                placeholder="What's included — bullet points are fine"
                value={service.included ?? ""}
                onChange={(e) => update({ ...service, included: e.target.value })}
                onBlur={form.flush}
              />
              <TextField
                id={`service-${index}-duration`}
                aria-label="How long it takes"
                placeholder="How long it takes"
                value={service.duration ?? ""}
                onChange={(e) => update({ ...service, duration: e.target.value })}
                onBlur={form.flush}
              />
              <TextField
                id={`service-${index}-longer`}
                aria-label="What makes it take longer"
                placeholder="What makes it take longer"
                value={service.whatMakesItLonger ?? ""}
                onChange={(e) =>
                  update({ ...service, whatMakesItLonger: e.target.value })
                }
                onBlur={form.flush}
              />
            </div>
          )}
        />
      </Field>

      <Field id="f-addons" label="Add-ons and extras">
        <RepeatableBlock<AddOnAnswer>
          items={addOns}
          onChange={(next) => form.setValue("addOns", next)}
          emptyItem={() => ({})}
          addLabel="Add another extra"
          renderItem={(addOn, index, update) => (
            <div className="space-y-3">
              <TextField
                id={`addon-${index}-name`}
                aria-label="Add-on name"
                placeholder="Add-on"
                value={addOn.name ?? ""}
                onChange={(e) => update({ ...addOn, name: e.target.value })}
                onBlur={form.flush}
              />
              <TextField
                id={`addon-${index}-price`}
                aria-label="Add-on price"
                placeholder="Price"
                value={addOn.price ?? ""}
                onChange={(e) => update({ ...addOn, price: e.target.value })}
                onBlur={form.flush}
              />
            </div>
          )}
        />
      </Field>

      <ChoiceAnswer
        form={form}
        name="extraCharges"
        label="Do you ever charge extra for any of these?"
        options={EXTRA_CHARGES}
        multiple
        exclusiveValue="none"
      />
      <TextAnswer
        form={form}
        name="extraChargesOther"
        label="Anything else you charge extra for"
      />

      <LongAnswer
        form={form}
        name="dontOffer"
        label="Things you don't offer"
        help="People ask for these but you don't do them — and whether that's 'never' or 'not yet'."
      />

      <TextAnswer form={form} name="minimumJob" label="Minimum job size" />

      <ChoiceAnswer
        form={form}
        name="paymentMethods"
        label="How customers pay"
        options={PAYMENT_METHODS}
        multiple
      />
      <TextAnswer
        form={form}
        name="paymentMethodsOther"
        label="Any other way they pay"
      />

      <ChoiceAnswer
        form={form}
        name="whenTheyPay"
        label="When they pay"
        options={WHEN_THEY_PAY}
      />

      {form.values.whenTheyPay === "depositUpFront" ? (
        <TextAnswer form={form} name="depositAmount" label="How much deposit?" />
      ) : null}

      <LongAnswer
        form={form}
        name="cancellationPolicy"
        label="Cancellation policy"
        help="If you don't have one written down, just tell us what you'd do."
      />
    </>
  );
}
