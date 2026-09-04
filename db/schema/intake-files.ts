import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { engagements } from "./engagements";

/**
 * One uploaded file — a logo, a photo, a voice note.
 *
 * Rows are written at signed-URL issuance and confirmed once the client's PUT
 * lands, so `uploadedAt` is null for a file that was started and abandoned.
 * The bytes never transit our functions; `storagePath` points into the private
 * `intake` bucket and is only ever handed out as a short-lived signed URL.
 *
 * `originalName` is metadata for Taylor's benefit and is never used to build
 * the storage path — a client-supplied filename is not trusted input.
 */
export const intakeFiles = pgTable(
  "intake_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    /**
     * Which repeatable entry this file belongs to, when it belongs to one.
     *
     * The showcase track uploads images inside project entries, so a file needs
     * to know which project it is a still of. The key is minted client-side
     * when the entry is added and stored in the answers document beside it;
     * `fieldKey` stays the field's own name, and this scopes it.
     *
     * Null for every upload that is not inside an entry, which is all of the
     * durable track's and most of the showcase track's. See M-PORT-3.
     */
    entryKey: text("entry_key"),
    fieldKey: text("field_key").notNull(),
    mimeType: text("mime_type"),
    originalName: text("original_name"),
    sizeBytes: integer("size_bytes"),
    step: integer("step"),
    storagePath: text("storage_path").notNull(),

    /**
     * The voice note, written out — and the four columns that say how much to
     * trust it.
     *
     * The transcript lives here rather than in the answers document because it
     * is derived from *this file*, not typed by the client (M-PORT-29). Two
     * recordings are two rows with two transcripts, and neither overwrites the
     * other; an answer key could only ever hold the last one. It also has
     * states an answer cannot have — never attempted, running, failed — and
     * `saveStepAnswers` replaces a step's object wholesale, so a transcript
     * parked in the document would be at the mercy of every later save.
     *
     * `transcriptStatus` null means **never attempted**, which is every row
     * that exists today and every upload that is not audio. `transcript` is
     * null until one lands. `transcriptEditedAt` null on a delivered
     * transcript means no human has read it, and the intake document says so
     * rather than presenting a machine's guess at a festival name as fact
     * (D-PORT-3).
     *
     * `transcriptAttempts` is this feature's whole budget, and it is per file
     * rather than per engagement (M-PORT-30): retry is a per-file action, and
     * a client who has spent their extraction runs must still be able to
     * transcribe.
     */
    transcribedAt: timestamp("transcribed_at", { withTimezone: true }),
    transcript: text("transcript"),
    transcriptAttempts: integer("transcript_attempts").notNull().default(0),
    transcriptEditedAt: timestamp("transcript_edited_at", {
      withTimezone: true,
    }),
    transcriptModel: text("transcript_model"),
    transcriptStatus: text("transcript_status"),

    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),

    engagementId: uuid("engagement_id")
      .notNull()
      .references(() => engagements.id, { onDelete: "cascade" }),
  },
  (table) => [index("intake_files_engagement_id_idx").on(table.engagementId)],
);

export const intakeFilesRelations = relations(intakeFiles, ({ one }) => ({
  engagement: one(engagements, {
    fields: [intakeFiles.engagementId],
    references: [engagements.id],
  }),
}));
