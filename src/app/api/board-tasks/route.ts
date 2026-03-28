import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET(req: NextRequest) {
  const columnIdsParam = req.nextUrl.searchParams.get('column_ids');
  if (!columnIdsParam) return NextResponse.json({ success: true, tasks: [] });
  
  const columnIds = columnIdsParam.split(',');
  if (columnIds.length === 0) return NextResponse.json({ success: true, tasks: [] });

  try {
    const placeholders = columnIds.map(() => '?').join(',');
    const { rows } = await db.execute({
      sql: `SELECT * FROM board_tasks WHERE column_id IN (${placeholders}) ORDER BY sort_order ASC`,
      args: columnIds
    });
    return NextResponse.json({ success: true, tasks: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, column_id, title, status, priority, date_range, assignees, image_url, sort_order } = await req.json();
    await db.execute({
      sql: 'INSERT INTO board_tasks (id, column_id, title, status, priority, date_range, assignees, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, column_id, title, status || 'To Do', priority || '보통', date_range || '', assignees || '', image_url || '', sort_order || 0]
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id;
    const sets = [];
    const args = [];
    
    if (body.column_id !== undefined) { sets.push('column_id = ?'); args.push(body.column_id); }
    if (body.title !== undefined) { sets.push('title = ?'); args.push(body.title); }
    if (body.status !== undefined) { sets.push('status = ?'); args.push(body.status); }
    if (body.priority !== undefined) { sets.push('priority = ?'); args.push(body.priority); }
    if (body.date_range !== undefined) { sets.push('date_range = ?'); args.push(body.date_range); }
    if (body.assignees !== undefined) { sets.push('assignees = ?'); args.push(body.assignees); }
    if (body.image_url !== undefined) { sets.push('image_url = ?'); args.push(body.image_url); }
    if (body.sort_order !== undefined) { sets.push('sort_order = ?'); args.push(body.sort_order); }
    
    if (sets.length === 0) return NextResponse.json({ success: true });
    
    args.push(id);
    await db.execute({
      sql: `UPDATE board_tasks SET ${sets.join(', ')} WHERE id = ?`,
      args
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await db.execute({ sql: 'DELETE FROM board_tasks WHERE id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
