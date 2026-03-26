import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET() {
  try {
    const projects = await turso.execute("SELECT id, label, url, color, pinned FROM projects WHERE archived = 0 ORDER BY sort_order");
    const stats = await Promise.all(
      projects.rows.map(async (p: any) => {
        const checks = await turso.execute({ sql: "SELECT done FROM checklists WHERE project_id = ?", args: [p.id] });
        const links = await turso.execute({ sql: "SELECT COUNT(*) as cnt FROM links WHERE project_id = ?", args: [p.id] });
        const memos = await turso.execute({ sql: "SELECT COUNT(*) as cnt FROM comments WHERE project_id = ?", args: [p.id] });
        return {
          id: p.id,
          label: p.label,
          url: p.url,
          color: p.color,
          pinned: p.pinned,
          checks_total: checks.rows.length,
          checks_done: checks.rows.filter((c: any) => c.done === 1).length,
          links_count: Number(links.rows[0]?.cnt || 0),
          memos_count: Number(memos.rows[0]?.cnt || 0),
        };
      })
    );
    return NextResponse.json(stats);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
