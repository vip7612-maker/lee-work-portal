import { NextResponse } from 'next/server';
import db from '@/lib/turso';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { orderedIds } = data;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ success: false, error: 'orderedIds must be an array of ids' }, { status: 400 });
    }

    // Execute updates sequentially. Turso can handle this for a small array of ids efficiently.
    // Alternatively, we could build a large CASE statement or execute a batch transaction.
    // LibSQL / Turso batch execute is ideal here.
    const statements = orderedIds.map((id, index) => ({
      sql: 'UPDATE aaron_features SET sort_order = ? WHERE id = ?',
      args: [index + 1, id] // starting sort_order from 1
    }));

    if (statements.length > 0) {
      await db.batch(statements);
    }

    return NextResponse.json({ success: true, message: 'Reordered successfully' });
  } catch (error: any) {
    console.error('Reorder Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
