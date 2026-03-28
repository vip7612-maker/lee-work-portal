const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  try {
    await db.execute(`ALTER TABLE board_tasks ADD COLUMN project_id TEXT DEFAULT ''`);
    console.log("project_id column added to board_tasks");
  } catch (err) {
    // Ignore error if column already exists
    if (err.message.includes("duplicate column name")) {
      console.log("Column project_id already exists.");
    } else {
      console.error(err);
    }
  }
}

run();
