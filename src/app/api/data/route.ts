import { NextResponse } from "next/server";
import { loadAppData, saveAppData, seedDatabase } from "@/lib/db/repository";
import { AppData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await seedDatabase(false);
    const data = await loadAppData();
    return NextResponse.json({ ok: true, data, seeded: count.seeded });
  } catch (err) {
    console.error("[api/data GET]", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "MySQL connection failed. Start MySQL and run: npm run db:setup",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as { data?: AppData; reset?: boolean };
    if (body.reset) {
      await seedDatabase(true);
      const data = await loadAppData();
      return NextResponse.json({ ok: true, data });
    }
    if (!body.data) {
      return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
    }
    await saveAppData(body.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/data PUT]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to save",
      },
      { status: 500 }
    );
  }
}
