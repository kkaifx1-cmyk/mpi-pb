import { Client } from "pg";

const connectionString = "postgresql://postgres.hiybrmedsoknemjphvvt:Sembarang-123@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL successfully!");

    // List existing tables to see what's already there
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Existing tables:", res.rows.map(r => r.table_name));

    // Create MPI tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS mpi_rooms (
        room_code VARCHAR(10) PRIMARY KEY,
        status VARCHAR(30) DEFAULT 'LOBBY',
        current_round INT DEFAULT 1,
        total_rounds INT DEFAULT 3,
        maker_team_id TEXT,
        maker_team_name TEXT,
        secret_prompt TEXT DEFAULT '',
        generated_image_url TEXT DEFAULT '',
        image_source TEXT DEFAULT '',
        english_prompt TEXT DEFAULT '',
        detected_meta JSONB,
        secret_prompt_pe JSONB,
        discussion_duration INT DEFAULT 60,
        guess_duration INT DEFAULT 90,
        timer_ends_at TIMESTAMPTZ,
        timer_remaining INT,
        timer_paused BOOLEAN DEFAULT FALSE,
        ai_model VARCHAR(50) DEFAULT 'agnes-image-2.1-flash',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mpi_teams (
        id TEXT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL REFERENCES mpi_rooms(room_code) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        score INT DEFAULT 0,
        guesses_count INT DEFAULT 0,
        total_accuracy FLOAT DEFAULT 0,
        is_connected BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(room_code, name)
      );

      CREATE TABLE IF NOT EXISTS mpi_submissions (
        id TEXT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL REFERENCES mpi_rooms(room_code) ON DELETE CASCADE,
        round_number INT NOT NULL,
        team_id TEXT NOT NULL,
        team_name VARCHAR(100) NOT NULL,
        guessed_prompt TEXT NOT NULL,
        score_data JSONB NOT NULL,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(room_code, round_number, team_id)
      );

      CREATE TABLE IF NOT EXISTS mpi_round_history (
        id TEXT PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL REFERENCES mpi_rooms(room_code) ON DELETE CASCADE,
        round_number INT NOT NULL,
        maker_name VARCHAR(100) NOT NULL,
        secret_prompt TEXT NOT NULL,
        generated_image_url TEXT,
        submissions JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Enable realtime publication on mpi tables in supabase
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'mpi_rooms'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE mpi_rooms;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'mpi_teams'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE mpi_teams;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = 'mpi_submissions'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE mpi_submissions;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END $$;
    `);

    console.log("MPI tables created and configured with Supabase Realtime successfully!");
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await client.end();
  }
}

main();
