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
 * Calculates the ISO Monday of the current week in UTC (same algorithm as SnapshotService).
 */
function getCurrentWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - (isoDayOfWeek - 1));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

/**
 * Shifts the current-week snapshot for a routine back by 7 days,
 * simulating it having been created in the previous week.
 * Throws if no snapshot is found for the current week.
 */
export async function shiftLatestSnapshotToPreviousWeek(routineId: number): Promise<void> {
    const currentWeekStart = getCurrentWeekStart();

    const prevDate = new Date(currentWeekStart);
    prevDate.setUTCDate(prevDate.getUTCDate() - 7);
    const prevWeekStart = prevDate.toISOString().slice(0, 10);

    const result = await pool.query(
        'UPDATE weekly_snapshots SET week_start_date = $1 WHERE routine_id = $2 AND week_start_date = $3',
        [prevWeekStart, routineId, currentWeekStart]
    );

    if ((result.rowCount ?? 0) === 0) {
        throw new Error(
            `shiftLatestSnapshotToPreviousWeek: no snapshot found for routine ${routineId} with week_start_date = ${currentWeekStart}`
        );
    }

    console.log(`[DB] Shifted snapshot for routine ${routineId}: ${currentWeekStart} → ${prevWeekStart}`);
}

export async function closeDbPool(): Promise<void> {
    await pool.end();
}
