import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const { updates } = await req.json();
    
    // We update each task sequentially
    for (const update of updates) {
      await db.execute({
        sql: 'UPDATE board_tasks SET column_id = ?, sort_order = ? WHERE id = ?',
        args: [update.column_id, update.sort_order, update.id]
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
