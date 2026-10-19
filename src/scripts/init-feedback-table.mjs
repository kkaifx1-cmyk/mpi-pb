import { Client } from "pg";

const connectionString = "postgresql://postgres.hiybrmedsoknemjphvvt:Sembarang-123@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS mpi_feedbacks (
        id TEXT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL,
        team_id TEXT NOT NULL,
        team_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL DEFAULT 5,
        today_feedback TEXT NOT NULL DEFAULT '',
        future_feedback TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(room_code, team_id)
      );
    `);

    try {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND tablename = 'mpi_feedbacks'
          ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE mpi_feedbacks;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          NULL;
        END $$;
      `);
    } catch (e) {
      console.log("Realtime publication note:", e.message);
    }

    console.log("Table mpi_feedbacks created and configured successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

main();
