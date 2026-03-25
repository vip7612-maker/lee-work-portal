import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET() {
  const { rows } = await db.execute('SELECT * FROM projects ORDER BY sort_order ASC');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, label, url, pinned, color, sort_order, archived } = body;
  await db.execute({
    sql: 'INSERT OR REPLACE INTO projects (id, label, url, pinned, color, sort_order, archived) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, label, url || '', pinned ? 1 : 0, color || '#000', sort_order || 0, archived ? 1 : 0],
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...fields } = body;
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const vals = Object.values(fields);
  await db.execute({ sql: `UPDATE projects SET ${sets} WHERE id = ?`, args: [...vals, id] });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [id] });
  return NextResponse.json({ ok: true });
}
