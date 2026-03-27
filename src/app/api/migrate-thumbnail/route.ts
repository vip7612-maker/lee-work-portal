import { NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function POST() {
  try {
    // Add thumbnail column
    await db.execute(`ALTER TABLE aaron_features ADD COLUMN thumbnail TEXT DEFAULT ''`);
    return NextResponse.json({ success: true, message: 'Thumbnail column added' });
  } catch (error: any) {
    if (error.message.includes('duplicate column name')) {
       return NextResponse.json({ success: true, message: 'Column already exists' });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
