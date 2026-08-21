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

    fieldKey: text("field_key").notNull(),
    mimeType: text("mime_type"),
    originalName: text("original_name"),
    sizeBytes: integer("size_bytes"),
    step: integer("step"),
    storagePath: text("storage_path").notNull(),
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
