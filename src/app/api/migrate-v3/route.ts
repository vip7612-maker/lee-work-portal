import { NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function GET() {
  try {
    const existingCols = await db.execute("PRAGMA table_info(aaron_features)");
    const cols = existingCols.rows.map(r => r.name);

    if (!cols.includes("category")) {
      await db.execute("ALTER TABLE aaron_features ADD COLUMN category TEXT DEFAULT '필수'");
    }
    if (!cols.includes("app_number")) {
      await db.execute("ALTER TABLE aaron_features ADD COLUMN app_number TEXT DEFAULT ''");
    }
    if (!cols.includes("keywords")) {
      await db.execute("ALTER TABLE aaron_features ADD COLUMN keywords TEXT DEFAULT ''");
    }

    return NextResponse.json({ success: true, message: 'Migration V3 completed safely.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
