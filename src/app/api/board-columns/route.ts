import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET(req: NextRequest) {
  const boardId = req.nextUrl.searchParams.get('board_id');
  if (!boardId) return NextResponse.json({ success: false, error: "board_id required" }, { status: 400 });
  
  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM board_columns WHERE board_id = ? ORDER BY sort_order ASC',
      args: [boardId]
    });
    return NextResponse.json({ success: true, columns: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, board_id, title, sort_order } = await req.json();
    await db.execute({
      sql: 'INSERT INTO board_columns (id, board_id, title, sort_order) VALUES (?, ?, ?, ?)',
      args: [id, board_id, title, sort_order || 0]
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, sort_order } = await req.json();
    const sets = [];
    const args = [];
    if (title !== undefined) { sets.push('title = ?'); args.push(title); }
    if (sort_order !== undefined) { sets.push('sort_order = ?'); args.push(sort_order); }
    
    if (sets.length === 0) return NextResponse.json({ success: true });
    
    args.push(id);
    await db.execute({
      sql: `UPDATE board_columns SET ${sets.join(', ')} WHERE id = ?`,
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
    await db.execute({ sql: 'DELETE FROM board_columns WHERE id = ?', args: [id] });
    // Also delete tasks belonging to this column
    await db.execute({ sql: 'DELETE FROM board_tasks WHERE column_id = ?', args: [id] });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
