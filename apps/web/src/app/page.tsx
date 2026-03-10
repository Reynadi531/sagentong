import { db } from "@sagentong/db";
import { laporan } from "@sagentong/db/schema/laporan";
import { desc } from "drizzle-orm";
import LandingFigma, { type LandingReport, type LandingActivity } from "./landing-figma";

export default async function Home() {
  const latestReports = await db.select().from(laporan).orderBy(desc(laporan.updatedAt)).limit(10);

  const formatTableDate = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} WIB - ${day}/${month}/${year}`;
  };

  const formatLogTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Limit table to 5 reports
  const reports: LandingReport[] = latestReports.slice(0, 5).map((r) => ({
    id: r.id,
    displayId: r.id.slice(0, 6).toUpperCase(),
    lokasi: `RT ${r.rt}/RW ${r.rw}`,
    status: r.status,
    updateTerakhir: formatTableDate(r.updatedAt),
  }));

  // Limit log to 4 activities
  const activities: LandingActivity[] = latestReports.slice(0, 4).map((r) => {
    const isNew = r.createdAt.getTime() === r.updatedAt.getTime();
    let action = "";
    if (isNew) {
      action = `Laporan baru dari RW ${r.rw}: ${r.needsType}.`;
    } else {
      action = `Laporan RW ${r.rw} status berubah menjadi ${r.status}.`;
    }

    return {
      id: r.id,
      time: formatLogTime(r.updatedAt),
      action,
    };
  });

  const lastUpdated =
    latestReports.length > 0 ? formatTableDate(latestReports[0]!.updatedAt) : "Belum ada data";

  return <LandingFigma reports={reports} activities={activities} lastUpdated={lastUpdated} />;
}
