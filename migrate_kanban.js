const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS board_columns (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log("board_columns created");

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
    console.log("board_tasks created");
  } catch (err) {
    console.error(err);
  }
}

run();
