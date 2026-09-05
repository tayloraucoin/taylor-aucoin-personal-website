"use client";

import { useRouter } from "next/navigation";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import type { IngestionRecord } from "@/lib/intake/ingestion-record";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { parseLinks } from "@/lib/intake/source-kinds";
import { copyPackFor } from "@/lib/intake/tracks";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { TextArea } from "../../../../intake/_components/text-field";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { readSourceFile } from "../../_actions/read-source";
import { IngestRun } from "../ingest-run";
import { SourceList, type SourceRow } from "../source-list";

/**
 * Step 1 — Everything you already have (PORT-18).
 *
 * One job: give us everything you already have, once. One focal input, the
 * paste box, and one secondary one, the file drop, under copy that says what
 * to paste, how deep to go, and what not to send. Nothing on this screen
 * competes with the box.
 *
 * **The paste autosaves as an ordinary answer from the moment it is typed**
 * (`dump`), so whatever happens to the read — an outage, a closed tab, a paste
 * too big to send — the hour it took to gather is already in the answers
 * document (D-PORT-3). Files go to the same bucket every other intake file
 * does, under `ingest_documents`, attached to this engagement. They are stored
 * for Taylor and are not read by the model yet; the copy says so rather than
 * implying a deck turns into answers (PORT-21 is the slice that reads them).
 *
 * **Once it has run, this step becomes a record of what was sent.** The paste
 * is read-only and the button is gone — not hidden, absent, because the run is
 * one-shot and an affordance that cannot work is worse than none. The client
 * can still come back to read what they sent and still add files for Taylor.
 * The rule is enforced in the database, not here: this is what it looks like.
 *
 * Every string comes from the pack's `ingestion` block, so Taylor's copy pass
 * edits one file. Only `what` flexes between kinds.
 */
export function StepIngest({
  token,
  initial,
  flavour,
  files,
  record = null,
  sources,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  /** Documents already dropped on this step. */
  files: readonly ExistingFile[];
  /** The run's record, once there is one. Null before, and in preview. */
  record?: IngestionRecord | null;
  /** Every document and fetched page, with what we made of each (PORT-21). */
  sources?: { documents: readonly SourceRow[]; links: readonly SourceRow[] };
}) {
  const copy = copyPackFor(flavour).ingestion;
  const form = useStepAutosave({ token, stepKey: "ingest", initial });
  useReportSaveState(form.state, form.retry);
  const document = useIsDocument();
  const preview = useIsPreview();
  const router = useRouter();

  const dump = typeof form.values.dump === "string" ? form.values.dump : "";
  const links = typeof form.values.links === "string" ? form.values.links : "";
  const ran = record !== null;

  // What the confirmation will say is about to be read. Counted from the same
  // rows the list below renders, so the manifest and the list cannot disagree.
  const documents = sources?.documents ?? [];
  const readyFiles = documents.filter(
    (row) => row.transcriptStatus === "done",
  ).length;
  const readingFiles = documents.filter(
    (row) => row.transcriptStatus === "pending",
  ).length;

  return (
    <>
      {ran ? (
        <Ran copy={copy.done} record={record} />
      ) : (
        <>
          <p className="mb-7 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            {copy.what}
          </p>

          <p className="mb-7 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            {copy.ceiling}
          </p>

          {/*
            The media line. Unmissable without being a warning: a card in the
            `KnownFact` grammar — mono eyebrow in gold, body in ink — rather
            than a gold sentence, because gold sentences on this form mean
            "something did not work" and nothing here is the client's mistake.
            In document mode it reads as plain copy, which is what it is.
          */}
          {document ? (
            <p className="mb-7 max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-dim)">
              {copy.media.label} — {copy.media.help}
            </p>
          ) : (
            <div className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
                {copy.media.label}
              </p>
              <p className="mt-2 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-ink)">
                {copy.media.help}
              </p>
            </div>
          )}
        </>
      )}

      <Field
        id="f-dump"
        label={ran ? copy.done.title : copy.paste.label}
        help={ran ? undefined : copy.paste.help}
        fieldKey="dump"
      >
        <TextArea
          id="f-dump"
          helpId={ran ? undefined : "f-dump-help"}
          rows={ran ? 8 : 14}
          // Not trimmed on the way in: trimming a textarea on every render
          // eats the space the client just typed.
          value={dump}
          onChange={(event) => form.setValue("dump", event.target.value)}
          onBlur={form.flush}
          placeholder={copy.paste.placeholder}
          // After a run this is a record of what was sent, not an input. It
          // stays legible and selectable rather than being greyed out.
          readOnly={ran}
        />
      </Field>

      {/* Links, above the drop: typing a URL is easier than finding a file,
          and the cheaper action goes first. Read at the run rather than on
          blur — fetching a page the moment someone pauses mid-typing would
          fetch half-written addresses. */}
      <Field
        id="f-links"
        label={copy.links.label}
        help={copy.links.help}
        fieldKey="links"
      >
        <TextArea
          id="f-links"
          helpId="f-links-help"
          rows={4}
          value={links}
          onChange={(event) => form.setValue("links", event.target.value)}
          onBlur={form.flush}
          placeholder={copy.links.placeholder}
          readOnly={ran}
        />
      </Field>

      <Field
        id="f-ingestDocuments"
        label={copy.files.label}
        help={copy.files.help}
      >
        <FileDrop
          token={token}
          stepKey="ingest"
          fieldKey="ingest_documents"
          label="Add documents"
          multiple
          existing={files}
          // Read the moment the bytes land, so a long deck is transcribed
          // while the client is still typing rather than inside the run's own
          // timeout — and so they can correct the reading before it is used.
          onUploaded={
            ran || preview
              ? undefined
              : (fileId) => {
                  void readSourceFile(token, fileId).then(() =>
                    router.refresh(),
                  );
                }
          }
        />
      </Field>

      {sources ? (
        <SourceList
          token={token}
          copy={copy.sources}
          documents={sources.documents}
          links={sources.links}
          omitted={record?.omitted ?? []}
          frozen={ran}
        />
      ) : null}

      {/* Absent once it has run, rather than disabled. */}
      {ran ? null : (
        <IngestRun
          token={token}
          flavour={flavour}
          hasSource={dump.trim().length > 0 || readyFiles > 0}
          manifest={{
            hasPaste: dump.trim().length > 0,
            files: readyFiles,
            links: parseLinks(links).urls.length,
            reading: readingFiles,
          }}
        />
      )}
    </>
  );
}

/**
 * What happened, on this visit and every one after it.
 *
 * Three outcomes and none of them is a failure state. A run that found nothing
 * usable is a run — the copy says no harm done and points at what happens
 * next, because a client who pasted a thin About page has not done anything
 * wrong. A partial run says which parts did not land without naming a stage
 * key at them.
 */
function Ran({
  copy,
  record,
}: {
  copy: {
    title: string;
    filled: string;
    nothing: string;
    partial: string;
    notReady: string;
    again: string;
  };
  record: IngestionRecord;
}) {
  const outcome =
    record.status === "partial"
      ? copy.partial
      : record.fields.length === 0
        ? copy.nothing
        : copy.filled.replace("{count}", String(record.fields.length));

  return (
    <div className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
      <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        {copy.title}
      </p>

      <p className="mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        {outcome}
      </p>

      {/* Named rather than counted: a client who sent four things and had one
          arrive late should see which one, not a number. */}
      {record.notReady?.length ? (
        <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-body)">
          {copy.notReady} {record.notReady.join(", ")}
        </p>
      ) : null}

      <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
        {copy.again}
      </p>
    </div>
  );
}
