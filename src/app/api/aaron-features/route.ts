import { NextResponse } from 'next/server';
import db from '@/lib/turso';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await db.execute('SELECT * FROM aaron_features ORDER BY sort_order ASC, id ASC');
    return NextResponse.json({ success: true, features: res.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await db.execute({
      sql: 'INSERT INTO aaron_features (id, icon, bgGrad, title, description, setupGuide, sort_order, thumbnail, category, app_number, keywords, badge_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        id, 
        data.icon || 'Bot', 
        data.bgGrad || 'linear-gradient(135deg, #0ea5e9, #0369a1)', 
        data.title || '새 기능', 
        data.description || '이 기능에 대한 설명입니다.', 
        data.setupGuide || '<p>설정 가이드를 작성하세요.</p>', 
        data.sort_order || 999,
        data.thumbnail || '',
        data.category || '필수',
        data.app_number || '',
        data.keywords || '',
        data.badge_color || '#0f172a'
      ]
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) throw new Error('ID is required');

    // Make dynamic update string depending on what is provided
    let fields = [];
    let args = [];
    if (data.icon !== undefined) { fields.push('icon = ?'); args.push(data.icon); }
    if (data.bgGrad !== undefined) { fields.push('bgGrad = ?'); args.push(data.bgGrad); }
    if (data.title !== undefined) { fields.push('title = ?'); args.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); args.push(data.description); }
    if (data.setupGuide !== undefined) { fields.push('setupGuide = ?'); args.push(data.setupGuide); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); args.push(data.sort_order); }
    if (data.thumbnail !== undefined) { fields.push('thumbnail = ?'); args.push(data.thumbnail); }
    if (data.category !== undefined) { fields.push('category = ?'); args.push(data.category); }
    if (data.app_number !== undefined) { fields.push('app_number = ?'); args.push(data.app_number); }
    if (data.keywords !== undefined) { fields.push('keywords = ?'); args.push(data.keywords); }
    if (data.badge_color !== undefined) { fields.push('badge_color = ?'); args.push(data.badge_color); }

    if (fields.length === 0) return NextResponse.json({ success: true }); // Nothing to update

    args.push(data.id);
    await db.execute({
      sql: `UPDATE aaron_features SET ${fields.join(', ')} WHERE id = ?`,
      args: args
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const data = await req.json();
    if (!data.id) throw new Error('ID is required');

    await db.execute({
      sql: 'DELETE FROM aaron_features WHERE id = ?',
      args: [data.id]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
