import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET(req: NextRequest) {
  const pid = req.nextUrl.searchParams.get('pid');
  if (!pid) return NextResponse.json([]);
  const { rows } = await db.execute({ sql: 'SELECT * FROM link_buttons WHERE project_id = ? ORDER BY sort_order ASC', args: [pid] });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { id, project_id, label, url, sort_order } = await req.json();
  await db.execute({
    sql: 'INSERT INTO link_buttons (id, project_id, label, url, sort_order) VALUES (?, ?, ?, ?, ?)',
    args: [id, project_id, label, url, sort_order || 0],
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const { id, ...fields } = await req.json();
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fields);
  await db.execute({ sql: `UPDATE link_buttons SET ${sets} WHERE id = ?`, args: [...vals, id] });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM link_buttons WHERE id = ?', args: [id] });
  return NextResponse.json({ ok: true });
}
