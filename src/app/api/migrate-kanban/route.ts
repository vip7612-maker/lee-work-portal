import { NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS board_columns (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS board_tasks (
        id TEXT PRIMARY KEY,
        column_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'To Do',
        priority TEXT DEFAULT '보통',
        date_range TEXT DEFAULT '',
        assignees TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
      )
    `);

    return NextResponse.json({ success: true, message: "Tables created successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
