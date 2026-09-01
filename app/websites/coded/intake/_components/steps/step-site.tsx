"use client";

import { INCLUDED_PAGES } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";

const PAGES = [
  { value: "home", label: "Home" },
  { value: "work", label: "Work / projects" },
  { value: "reel", label: "A reel page" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "teaching", label: "A page for teaching or services" },
  { value: "press", label: "Press / news" },
] as const;

const HOW_TO_REACH = [
  { value: "email", label: "An email link — no form" },
  { value: "form", label: "A short form" },
  { value: "both", label: "Both" },
  { value: "rep", label: "Through my rep" },
] as const;

const AVAILABILITY = [
  { value: "yes", label: "Yes — show availability" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

/**
 * Step 8 — The site itself.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 8,
 * verbatim.
 *
 * The over-five note is the delicate part. It is **information, not a warning
 * and not a quote**: dim body copy, never gold, no arithmetic, no total, no
 * price attached to the count. The copy promises that nothing extra is charged
 * without a conversation first, and a screen that quietly totalled up $150s
 * while someone ticked boxes would be having that conversation with itself.
 *
 * Nothing on this step can charge anything. That is structural, not
 * disciplinary — there is no payment code on this surface at all, and the
 * extra-page path is Taylor-initiated only (M-PORT-4).
 */
export function StepSite({
  token,
  initial,
}: {
  token: string;
  initial: Record<string, unknown>;
}) {
  const form = useStepAutosave({ token, stepKey: "site", initial });
  useReportSaveState(form.state, form.retry);

  const pages = Array.isArray(form.values.pages)
    ? (form.values.pages as string[])
    : [];
  const over = pages.length > INCLUDED_PAGES;

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="pages"
        label="Pages you're imagining"
        help="Check what feels right — we'll push back if something's missing or unnecessary, and flag it before anything goes past the five included."
        options={PAGES}
        multiple
        note={
          over ? (
            // [COPY — pending Taylor]
            <span className="text-(--color-dim)">
              That&apos;s {pages.length} pages — {INCLUDED_PAGES} are included.
              Nothing extra gets charged without a conversation first.
            </span>
          ) : undefined
        }
      />

      <TextAnswer form={form} name="pagesOther" label="Something else?" />

      <LongAnswer
        form={form}
        name="howSeparate"
        label="If you do more than one thing, how separate should they be?"
        help="A producer looking at your reel and a parent looking at your film camp want different things. Different pages? Different sections? Or does one of them belong on a separate site entirely?"
      />

      <ChoiceAnswer
        form={form}
        name="howToReach"
        label="How should people reach you?"
        help="Forms filter people; a bare email converts. For sites like this we usually recommend the email."
        options={HOW_TO_REACH}
      />

      <ChoiceAnswer
        form={form}
        name="showAvailability"
        label="Should the site say whether you're available?"
        help={`"Booking for fall 2026" can prompt the email. It also needs updating — only say yes if you'll actually update it.`}
        options={AVAILABILITY}
      />

      <LongAnswer
        form={form}
        name="oldSiteSurvives"
        label="Your old site: what must survive?"
        help="Anything on the current site that has to carry over — and anything that should die with it."
      />

      <LongAnswer
        form={form}
        name="linksOutThere"
        label="Links out in the world"
        help="If your site's been up for years, links to it live in old emails, articles, festival pages. We'll redirect the important ones — any addresses you know people still use?"
      />
    </>
  );
}
