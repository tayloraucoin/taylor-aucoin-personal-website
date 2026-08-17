import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Temporary. Writes an exported banner straight into `public/banner/` so the
 * file lands in the repo instead of the browser's download folder.
 *
 * Dev only — it hard-refuses in production, and it is deleted along with the
 * rest of `app/banner-export/`. It writes exactly one fixed directory and
 * rejects any name that is not a plain `banner-*.png`, so a stray request
 * cannot pick its own path.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }

  const url = new URL(req.url);
  const name = url.searchParams.get("name") ?? "banner.png";
  if (!/^banner-[\w.-]{1,60}\.png$/.test(name)) {
    return NextResponse.json({ error: "bad name" }, { status: 400 });
  }

  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length > 40_000_000) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }

  const dir = path.join(process.cwd(), "public", "banner");
  const file = path.join(dir, name);
  await writeFile(file, bytes);
  return NextResponse.json({ ok: true, path: `public/banner/${name}` });
}
