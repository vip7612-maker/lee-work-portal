import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET(req: NextRequest) {
  const pid = req.nextUrl.searchParams.get('pid');
  if (!pid) return NextResponse.json([]);
  const { rows } = await db.execute({ sql: 'SELECT * FROM comments WHERE project_id = ? ORDER BY created_at ASC', args: [pid] });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { id, project_id, text } = await req.json();
  await db.execute({
    sql: 'INSERT INTO comments (id, project_id, text) VALUES (?, ?, ?)',
    args: [id, project_id, text],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.execute({ sql: 'DELETE FROM comments WHERE id = ?', args: [id] });
  return NextResponse.json({ ok: true });
}
