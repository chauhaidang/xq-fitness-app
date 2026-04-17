/**
 * Weekly Report — Detox E2E tests
 *
 * Covers:
 * 1. Snapshot captures updated sets when a new workout day is added via UI
 * 2. Snapshot captures updated sets when an existing workout day is edited via UI
 */
import * as kit from '@chauhaidang/xq-common-kit';
import {
    createRoutine,
    deleteRoutine,
    createWorkoutDay,
    createWorkoutDaySet, // deprecated in client but ManageExerciseScreen still reads day.sets
} from '@chauhaidang/write-service-api';
import { createClient, createConfig } from '@hey-api/client-fetch';
import { MuscleGroupId } from './enum';
import MyRoutinesPage from './page-objects/my-routines.page';
import RoutineDetailPage from './page-objects/routine-detail.page';
import WeeklyReportPage from './page-objects/weekly-report.page';

const BASE_URL = 'http://localhost:8080/xq-fitness-write-service/api/v1';

describe('Weekly Report', () => {
    let client: any;
    let trackRoutines: number[] = [];

    beforeEach(() => {
        client = createClient(createConfig({ baseUrl: BASE_URL }));
        trackRoutines = [];
    });

    afterEach(async () => {
        for (const routineId of trackRoutines) {
            try {
                await deleteRoutine({ client, path: { routineId } });
            } catch (error) {
                console.error(`Failed to delete routine ${routineId}:`, error);
            }
        }
    });

    describe('When creating snapshot from UI', () => {
        it('should capture updated workout day sets when creating snapshot after adding another workout day', async () => {
            const routineName = kit.generateRandomString(5);

            // API setup first — useFocusEffect will pick up new routine when list regains focus
            const routine = await createRoutine({
                client,
                body: {
                    name: routineName,
                    description: 'test update routine workout days set',
                    isActive: true,
                },
            });
            trackRoutines.push(routine.data!.id);

            // Workout day 1: Monday Upper (Chest: 4, Back: 3, Abductor: 2)
            const workoutDay1 = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 1,
                    dayName: 'Monday Upper',
                },
            });

            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay1.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    numberOfSets: 4,
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay1.data!.id,
                    muscleGroupId: MuscleGroupId.Back,
                    numberOfSets: 3,
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay1.data!.id,
                    muscleGroupId: MuscleGroupId.Abductor,
                    numberOfSets: 2,
                },
            });

            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routineName);

            await RoutineDetailPage.waitForScreen();
            // Add workout day 2 via UI (Wednesday Upper: Chest +3, Back +2)
            await RoutineDetailPage.addWorkoutDay(
                'Wednesday Upper',
                2,
                '3 sets of chest',
                '2 sets of back',
            );

            // Create snapshot (captures both workout days)
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();

            // Navigate back to routine list
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();

            // View report: Chest 4+3=7, Back 3+2=5, Abductor 2+0=2
            await MyRoutinesPage.tapReportButton(routine.data!.id);

            await WeeklyReportPage.waitForScreen();
            await WeeklyReportPage.verifyMuscleGroupTotal('Chest', 7);
            await WeeklyReportPage.verifyMuscleGroupTotal('Back', 5);
            await WeeklyReportPage.verifyMuscleGroupTotal('Abductor', 2);
        });

        it('should capture updated workout day sets when creating snapshot after editing existing workout day', async () => {
            const routineName = kit.generateRandomString(5);

            // API setup first
            const routine = await createRoutine({
                client,
                body: {
                    name: routineName,
                    description: 'Test routine for snapshot after edit',
                    isActive: true,
                },
            });
            trackRoutines.push(routine.data!.id);

            const workoutDay = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 1,
                    dayName: 'Monday Upper',
                },
            });

            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    numberOfSets: 4,
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Abductor,
                    numberOfSets: 3,
                },
            });

            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routine.data!.name);

            await RoutineDetailPage.waitForScreen();
            // Edit Chest sets 4 → 6 using backend dayId
            await RoutineDetailPage.editWorkoutDaySet(workoutDay.data!.id, MuscleGroupId.Chest, 6);

            // Verify the edit was successful before creating snapshot
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, 'Chest', 6);

            // Create snapshot (should capture updated sets: 6)
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();

            // Navigate back and view report
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();

            await MyRoutinesPage.tapReportButton(routine.data!.id);

            await WeeklyReportPage.waitForLoadingToComplete();
            await WeeklyReportPage.verifyMuscleGroupTotal('Chest', 6);
            await WeeklyReportPage.verifyMuscleGroupTotal('Abductor', 3);
        });
    });
});
