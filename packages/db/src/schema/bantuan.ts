import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { laporan } from "./laporan";

export const bantuanRelawan = pgTable("bantuan_relawan", {
  id: uuid("id").primaryKey().defaultRandom(),
  laporanId: uuid("laporan_id")
    .notNull()
    .references(() => laporan.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  jenisBantuan: text("jenis_bantuan").notNull(), // 'Dana', 'Jasa', 'Barang'
  keterangan: text("keterangan").notNull(),
  evidenceImage: text("evidence_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
