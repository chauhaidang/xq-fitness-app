import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'xq_fitness',
    user: 'xq_user',
    password: 'xq_password',
    ssl: false,
});

/**
 * Shifts the most recent weekly snapshot for a routine back by 7 days,
 * simulating it having been created in the previous week.
 * Use this in test setup to enable progress comparison between two weeks.
 */
export async function shiftLatestSnapshotToPreviousWeek(routineId: number): Promise<void> {
    const result = await pool.query<{ week_start_date: string }>(
        'SELECT week_start_date FROM weekly_snapshots WHERE routine_id = $1 ORDER BY created_at DESC LIMIT 1',
        [routineId]
    );
    if (result.rows.length === 0) {
        throw new Error(`No snapshot found for routine ${routineId}`);
    }

    const currentWeekStart = result.rows[0].week_start_date;
    const prevDate = new Date(currentWeekStart);
    prevDate.setUTCDate(prevDate.getUTCDate() - 7);
    const prevWeekStart = prevDate.toISOString().slice(0, 10);

    await pool.query(
        'UPDATE weekly_snapshots SET week_start_date = $1 WHERE routine_id = $2 AND week_start_date = $3',
        [prevWeekStart, routineId, currentWeekStart]
    );
}

export async function closeDbPool(): Promise<void> {
    await pool.end();
}
