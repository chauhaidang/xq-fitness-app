/**
 * Exercise Daily Journey Workflow — Detox E2E tests
 *
 * Tests complete daily user journey:
 * - Create routine (API) → Add workout days + sets (API) → Add exercises (UI)
 *   including Bench Press on both days for accumulative report
 *   → Create snapshot (UI) → View report (UI) verifying aggregated totals
 *
 * Also covers:
 * - Progress tracking: INCREASED status for reps and weight vs previous week
 */
import * as kit from '@chauhaidang/xq-common-kit';
import {
    createRoutine,
    deleteRoutine,
    createWorkoutDay,
    createWorkoutDaySet, // deprecated in client but ManageExerciseScreen still reads day.sets to render muscle group sections
    createExercise,
    updateExercise,
    createWeeklySnapshot,
} from '@chauhaidang/write-service-api';
import { createClient, createConfig } from '@hey-api/client-fetch';
import { MuscleGroupId } from './enum';
import { shiftLatestSnapshotToPreviousWeek } from '../support/utils/db-helper';
import MyRoutinesPage from './page-objects/my-routines.page';
import RoutineDetailPage from './page-objects/routine-detail.page';
import ManageExercisePage from './page-objects/manage-exercise.page';
import WeeklyReportPage from './page-objects/weekly-report.page';

const BASE_URL = 'http://localhost:8080/xq-fitness-write-service/api/v1';

describe('Exercise Daily Journey Workflow', () => {
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
            } catch (e) {
                console.log(`Failed to delete routine by ID: ${routineId}`, e);
            }
        }
    });

    describe('Complete daily user journey with exercises', () => {
        it('should create routine → add workout days → add multiple exercises via UI → create snapshot → view weekly report (verify exercise totals)', async () => {
            const routineName = 'Exercise Test Routine ' + kit.generateRandomString(5);
            const dayName = 'Monday Push Day';
            const day2Name = 'Wednesday Push Day';
            const muscleGroupName = 'Chest';
            const backMuscleGroupName = 'Back';

            // SETUP: Create routine and workout days via API first
            const routine = await createRoutine({
                client,
                body: {
                    name: routineName,
                    description: 'Test routine for exercise workflow',
                    isActive: true,
                },
            });
            trackRoutines.push(routine.data!.id);

            const workoutDay = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 1,
                    dayName,
                },
            });

            // Chest: 6 sets (Bench Press 3 + Incline Dumbbell Press 3); Back: 4 sets (Pull-ups)
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    numberOfSets: 6,
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Back,
                    numberOfSets: 4,
                },
            });

            const workoutDay2 = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 2,
                    dayName: day2Name,
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay2.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    numberOfSets: 3,
                },
            });

            // Navigate to routine detail — useFocusEffect picks up new routine
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routineName);
            await RoutineDetailPage.waitForScreen();

            // ADD EXERCISES via UI
            // Exercise 1: Bench Press on day 1 (Chest)
            await RoutineDetailPage.tapExercisesForDay(workoutDay.data!.id);
            await ManageExercisePage.waitForScreen();
            await ManageExercisePage.tapAddExerciseForMuscleGroup(muscleGroupName);
            await ManageExercisePage.enterExerciseName('Bench Press');
            await ManageExercisePage.enterTotalReps(30);
            await ManageExercisePage.enterWeight(135);
            await ManageExercisePage.enterTotalSets(3);
            await ManageExercisePage.enterNotes('Focus on form');
            await ManageExercisePage.tapSave();
            await ManageExercisePage.tapBack();

            // Verify Chest sets after Bench Press (3 sets)
            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, muscleGroupName, 3);

            // Exercise 2: Incline Dumbbell Press on day 1 (Chest)
            await RoutineDetailPage.tapExercisesForDay(workoutDay.data!.id);
            await ManageExercisePage.waitForScreen();
            await ManageExercisePage.tapAddExerciseForMuscleGroup(muscleGroupName);
            await ManageExercisePage.enterExerciseName('Incline Dumbbell Press');
            await ManageExercisePage.enterTotalReps(24);
            await ManageExercisePage.enterWeight(50);
            await ManageExercisePage.enterTotalSets(3);
            await ManageExercisePage.tapSave();
            await ManageExercisePage.tapBack();

            // Verify Chest sets after both exercises (6 total)
            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, muscleGroupName, 6);

            // Exercise 3: Pull-ups on day 1 (Back)
            await RoutineDetailPage.tapExercisesForDay(workoutDay.data!.id);
            await ManageExercisePage.waitForScreen();
            await ManageExercisePage.tapAddExerciseForMuscleGroup(backMuscleGroupName);
            await ManageExercisePage.enterExerciseName('Pull-ups');
            await ManageExercisePage.enterTotalReps(30);
            await ManageExercisePage.enterWeight(0);
            await ManageExercisePage.enterTotalSets(4);
            await ManageExercisePage.tapSave();
            await ManageExercisePage.tapBack();

            // Verify Back sets (4 sets from Pull-ups)
            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, backMuscleGroupName, 4);

            // Exercise 4: Bench Press on day 2 (Chest) — for highest-occurrence validation
            await RoutineDetailPage.tapExercisesForDay(workoutDay2.data!.id);
            await ManageExercisePage.waitForScreen();
            await ManageExercisePage.tapAddExerciseForMuscleGroup(muscleGroupName);
            await ManageExercisePage.enterExerciseName('Bench Press');
            await ManageExercisePage.enterTotalReps(25);
            await ManageExercisePage.enterWeight(130);
            await ManageExercisePage.enterTotalSets(3);
            await ManageExercisePage.tapSave();
            await ManageExercisePage.tapBack();

            // Verify day 2 Chest sets (3 sets from Bench Press)
            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay2.data!.id, muscleGroupName, 3);

            // SNAPSHOT
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();

            // VIEW REPORT
            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapReportButton(routine.data!.id);

            await WeeklyReportPage.waitForScreen();
            await WeeklyReportPage.waitForLoadingToComplete();
            await WeeklyReportPage.verifyReportDisplayed();

            // Bench Press: highest occurrence — day 1 (30 reps, 135 kg) vs day 2 (25 reps, 130 kg)
            await WeeklyReportPage.verifyExerciseTotalDisplayed('Bench Press', 30, 135);
            await WeeklyReportPage.verifyExerciseTotalDisplayed('Incline Dumbbell Press', 24, 50);
            await WeeklyReportPage.verifyExerciseTotalDisplayed('Pull-ups', 30, 0);
            await WeeklyReportPage.verifyExerciseTotalsCount(3);

            // Muscle group totals: Chest day1(6)+day2(3)=9, Back day1(4)=4
            await WeeklyReportPage.verifyMuscleGroupTotal('Chest', 9);
            await WeeklyReportPage.verifyMuscleGroupTotal('Back', 4);
        });

        it('should show INCREASED progress status for reps and weight when exercises improve compared to previous week', async () => {
            const routineName = 'Progress Test ' + kit.generateRandomString(5);

            // WEEK 1 setup via API
            const routine = await createRoutine({
                client,
                body: {
                    name: routineName,
                    description: 'Test exercise progress tracking between two weeks',
                    isActive: true,
                },
            });
            trackRoutines.push(routine.data!.id);

            const workoutDay = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 1,
                    dayName: 'Push Day',
                },
            });
            await createWorkoutDaySet({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    numberOfSets: 3,
                },
            });

            // WEEK 1: Create baseline exercise via API (Bench Press: 20 reps, 100 kg, 3 sets)
            const exercise = await createExercise({
                client,
                body: {
                    workoutDayId: workoutDay.data!.id,
                    muscleGroupId: MuscleGroupId.Chest,
                    exerciseName: 'Bench Press',
                    totalReps: 20,
                    weight: 100,
                    totalSets: 3,
                },
            });

            // Create week 1 snapshot via API, then shift it to previous week in DB
            await createWeeklySnapshot({ client, path: { routineId: routine.data!.id } });
            await shiftLatestSnapshotToPreviousWeek(routine.data!.id);

            // WEEK 2: Improve exercise values (reps: 20→25, weight: 100→110)
            await updateExercise({
                client,
                path: { exerciseId: exercise.data!.id },
                body: { totalReps: 25, weight: 110 },
            });

            // Navigate to routine — useFocusEffect picks up routine on list focus
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routineName);

            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.tapCreateSnapshot();
            await RoutineDetailPage.waitForSnapshotCreationComplete();

            await RoutineDetailPage.tapBack();
            await MyRoutinesPage.waitForScreen();

            // VIEW REPORT: Verify progress badges show INCREASED (reps 25>20, weight 110>100)
            await MyRoutinesPage.tapReportButton(routine.data!.id);

            await WeeklyReportPage.waitForScreen();
            await WeeklyReportPage.waitForLoadingToComplete();

            await WeeklyReportPage.verifyExerciseTotalDisplayed('Bench Press', 25, 110);
            await WeeklyReportPage.verifyExerciseProgressStatus('Bench Press', 'INCREASED', 'INCREASED');
        });
    });
});
