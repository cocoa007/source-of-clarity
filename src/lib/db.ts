import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL || "postgres://agent@/source_of_clarity?host=/var/run/postgresql",
});

export const db = drizzle(pool, { schema });
