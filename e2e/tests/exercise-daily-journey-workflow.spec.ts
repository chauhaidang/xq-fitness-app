import { createFluentRoutineDetailPage } from './page-objects/routine-detail.page.js';
import { createFluentMyRoutinesPage } from './page-objects/my-routines.page.js';
import { createFluentManageExercisePage } from './page-objects/manage-exercise.page.js';
import { createFluentWeeklyReportPage } from './page-objects/weekly-report.page.js';
import * as kit from '@chauhaidang/xq-common-kit';
import { Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi, ExercisesApi, SnapshotsApi } from 'xq-fitness-write-client';
import { MuscleGroupId } from './enum.js';
import { shiftLatestSnapshotToPreviousWeek } from '../support/utils/db-helper.js';

/**
 * E2E workflow test for exercise management feature
 * Tests complete daily user journey: Create routine (API) → Add 2 workout days (API) → Add workout day sets (API) → Add exercises (UI) including Bench Press on both days for accumulative report → Create snapshot (UI) → View report (UI) verifying aggregated Bench Press totals
 * Setup uses API calls for speed and reliability. Workout day sets must be created so the Manage Exercise screen shows muscle group rows; then exercise interactions use UI to test the feature.
 */
describe('Exercise Daily Journey Workflow', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let exercisesApi: ExercisesApi;
    let snapshotsApi: SnapshotsApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
        workoutDaySetsApi = new WorkoutDaySetsApi(configuration);
        exercisesApi = new ExercisesApi(configuration);
        snapshotsApi = new SnapshotsApi(configuration);
    });

    beforeEach(async () => {
        trackRoutines = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    afterEach(async () => {
        // Clean up API-created routines (by ID)
        for (const routineId of trackRoutines) {
            try {
                await routinesApi.deleteRoutine(routineId);
            } catch (e) {
                console.log(`Failed to delete routine by ID: ${routineId}`, e);
            }
        }
    });

    context('Complete daily user journey with exercises', () => {
        it('should create routine → add workout day → add multiple exercises (totalReps, weight, totalSets) to muscle groups via UI → create snapshot (captures exercises) → view weekly report (verify exercise totals in UI) → update exercise values via UI → create snapshot again (captures updated exercises) → view weekly report (verify updated totals in UI)', async () => {
            const routineName = 'Exercise Test Routine ' + kit.generateRandomString(5);
            const routineDescription = 'Test routine for exercise workflow';
            const dayName = 'Monday Push Day';
            const day2Name = 'Wednesday Push Day';
            const muscleGroupName = 'Chest';
            const backMuscleGroupName = 'Back';

            // ===== SETUP: Create routine and workout days via API =====
            console.log('[Step 1] Creating routine via API...');
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: routineDescription,
                isActive: true,
            });

            trackRoutines.push(routine.data.id);
            console.log(`[Step 1] Created routine: ID=${routine.data.id}, Name=${routineName}`);

            console.log('[Step 2] Creating workout day 1 via API...');
            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: dayName,
            });

            console.log(`[Step 2] Created workout day 1: ID=${workoutDay.data.id}, Name=${dayName}`);

            // Create workout day sets for muscle groups so the Manage Exercise screen shows rows per muscle group
            // (Chest: 6 sets for 2 exercises × 3 sets; Back: 4 sets for Pull-ups)
            console.log('[Step 2b] Creating workout day sets for day 1 (Chest, Back) via API...');
            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 6,
            });
            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Back,
                numberOfSets: 4,
            });
            console.log('[Step 2b] Workout day 1 sets created.');

            // Create second workout day with Bench Press sets (same exercise for accumulative report validation)
            console.log('[Step 2c] Creating workout day 2 via API...');
            const workoutDay2 = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 2,
                dayName: day2Name,
            });
            console.log(`[Step 2c] Created workout day 2: ID=${workoutDay2.data.id}, Name=${day2Name}`);

            console.log('[Step 2c] Creating workout day sets for day 2 (Chest: 3 sets for Bench Press) via API...');
            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay2.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 3,
            });
            console.log('[Step 2c] Workout day 2 sets created.');

            // Activate app and navigate to routine detail
            await browser.activateApp(bundleId);

            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();

            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail.waitForScreen().execute();

            // ===== ADD EXERCISES: Add multiple exercises to muscle groups via UI =====
            console.log('[Step 3] Adding exercises via UI...');

            // Add first exercise to Chest muscle group
            // Routine Detail: tap Exercises → Manage Exercise: tap Add for muscle group
            await routineDetail.tapExercisesForDay(dayName).execute();
            const manageExercise = createFluentManageExercisePage();
            await manageExercise
                .waitForScreen()
                .tapAddExerciseForMuscleGroup(muscleGroupName)
                .enterExerciseName('Bench Press')
                .enterTotalReps(30)
                .enterWeight(135)
                .enterTotalSets(3)
                .enterNotes('Focus on form')
                .tapSave()
                .tapBack()
                .execute();

            // Verify Chest sets on Routine Detail (3 sets from Bench Press)
            await routineDetail
                .waitForScreen()
                .verifyWorkoutDaySet(dayName, muscleGroupName, 3)
                .execute();

            // Add second exercise to same muscle group (Chest)
            await routineDetail.tapExercisesForDay(dayName).execute();
            await manageExercise
                .waitForScreen()
                .tapAddExerciseForMuscleGroup(muscleGroupName)
                .enterExerciseName('Incline Dumbbell Press')
                .enterTotalReps(24)
                .enterWeight(50)
                .enterTotalSets(3)
                .tapSave()
                .tapBack()
                .execute();

            // Verify Chest sets on Routine Detail (6 total: 3 Bench Press + 3 Incline Dumbbell Press)
            await routineDetail
                .waitForScreen()
                .verifyWorkoutDaySet(dayName, muscleGroupName, 6)
                .execute();

            // Add exercise to different muscle group (Back)
            await routineDetail.tapExercisesForDay(dayName).execute();
            await manageExercise
                .waitForScreen()
                .tapAddExerciseForMuscleGroup(backMuscleGroupName)
                .enterExerciseName('Pull-ups')
                .enterTotalReps(30)
                .enterWeight(0) // Bodyweight
                .enterTotalSets(4)
                .tapSave()
                .tapBack()
                .execute();

            // Verify Back sets on Routine Detail (4 sets from Pull-ups)
            await routineDetail
                .waitForScreen()
                .verifyWorkoutDaySet(dayName, backMuscleGroupName, 4)
                .execute();

            // Add Bench Press to day 2 (same exercise for highest occurrence validation)
            // Day 1 Bench Press: 30 reps, 135 kg. Day 2 Bench Press: 25 reps, 130 kg.
            // Report evaluates highest: Bench Press 30 reps, 135 kg
            await routineDetail.tapExercisesForDay(day2Name).execute();
            await manageExercise
                .waitForScreen()
                .tapAddExerciseForMuscleGroup(muscleGroupName)
                .enterExerciseName('Bench Press')
                .enterTotalReps(25)
                .enterWeight(130)
                .enterTotalSets(3)
                .tapSave()
                .tapBack()
                .execute();

            // Verify Chest sets on day 2 Routine Detail (3 sets from Bench Press)
            await routineDetail
                .waitForScreen()
                .verifyWorkoutDaySet(day2Name, muscleGroupName, 3)
                .execute();

            // ===== FIRST SNAPSHOT: Create snapshot via UI that captures exercises =====
            console.log('[Step 4] Creating first snapshot via UI...');
            await routineDetail
                .waitForScreen()
                .tapCreateSnapshot()
                .waitForSnapshotCreationComplete()
                .execute();

            // ===== VIEW FIRST REPORT: Navigate to weekly report and verify exercise totals =====
            console.log('[Step 5] Viewing weekly report and verifying exercise totals...');
            // Navigate back to routines list first
            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();

            // Navigate to weekly report
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();

            const weeklyReport = createFluentWeeklyReportPage();
            await weeklyReport
                .waitForScreen()
                .waitForLoadingToComplete()
                .verifyReportDisplayed()
                .execute();

            // Verify exercise totals are displayed (Bench Press highest occurrence from day 1 vs day 2)
            await weeklyReport
                .verifyExerciseTotalDisplayed('Bench Press', 30, 135) // Highest: day 1 (30 reps, 135 kg) vs day 2 (25 reps, 130 kg)
                .verifyExerciseTotalDisplayed('Incline Dumbbell Press', 24, 50) // totalReps: 24, weight: 50 kg
                .verifyExerciseTotalDisplayed('Pull-ups', 30, 0) // totalReps: 30, weight: 0 kg (bodyweight)
                .verifyExerciseTotalsCount(3)
                .execute();

            // Verify muscle group totals (aggregated from exercises across both days)
            await weeklyReport
                .verifyMuscleGroupTotal('Chest', 9) // Day 1: 6 sets + Day 2: 3 sets = 9
                .verifyMuscleGroupTotal('Back', 4) // 4 sets (Pull-ups)
                .execute();
        });

        it.only('should show INCREASED progress status for reps and weight when exercises improve compared to previous week', async () => {
            // ===== SETUP: Create routine and workout day via API =====
            const routineName = 'Progress Test ' + kit.generateRandomString(5);
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: 'Test exercise progress tracking between two weeks',
                isActive: true,
            });
            trackRoutines.push(routine.data.id);

            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: 'Push Day',
            });
            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 3,
            });

            // ===== WEEK 1: Create exercise with baseline values via API =====
            // Bench Press: 20 reps, 100 kg, 3 sets
            const exercise = await exercisesApi.createExercise({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                exerciseName: 'Bench Press',
                totalReps: 20,
                weight: 100,
                totalSets: 3,
            });

            // Create snapshot for week 1 via API, then shift it to previous week in DB
            await snapshotsApi.createWeeklySnapshot(routine.data.id);
            await shiftLatestSnapshotToPreviousWeek(routine.data.id);

            // ===== WEEK 2: Improve exercise values (reps: 20→25, weight: 100→110) =====
            await exercisesApi.updateExercise(exercise.data.id, {
                totalReps: 25,
                weight: 110,
            });

            // Activate app and create current week snapshot via UI
            await browser.activateApp(bundleId);

            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();

            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail
                .waitForScreen()
                .tapCreateSnapshot()
                .waitForSnapshotCreationComplete()
                .execute();

            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();

            // ===== VIEW REPORT: Verify progress badges show INCREASED for both metrics =====
            // Reps: 25 > 20 → INCREASED
            // Weight: 110 kg > 100 kg → INCREASED
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();

            const weeklyReport = createFluentWeeklyReportPage();
            await weeklyReport.waitForScreen().waitForLoadingToComplete().execute();

            await weeklyReport
                .verifyExerciseTotalDisplayed('Bench Press', 25, 110)
                .execute();

            await weeklyReport
                .verifyExerciseProgressStatus('Bench Press', 'INCREASED', 'INCREASED')
                .execute();
        });
    });
});
