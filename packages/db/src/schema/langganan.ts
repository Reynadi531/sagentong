import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { laporan } from "./laporan";

export const langgananLaporan = pgTable(
  "langganan_laporan",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    laporanId: uuid("laporan_id")
      .notNull()
      .references(() => laporan.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("langganan_laporan_user_laporan_unique").on(table.userId, table.laporanId)],
);
