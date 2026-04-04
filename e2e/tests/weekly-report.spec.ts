import { createFluentMyRoutinesPage } from './page-objects/my-routines.page.js';
import { createFluentRoutineDetailPage } from './page-objects/routine-detail.page.js';
import { createFluentWeeklyReportPage } from './page-objects/weekly-report.page.js';
import * as kit from '@chauhaidang/xq-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from './enum.js';

describe('Weekly Report', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
        workoutDaysApi = new WorkoutDaysApi(configuration);
        workoutDaySetsApi = new WorkoutDaySetsApi(configuration);
    });

    beforeEach(async () => {
        trackRoutines = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    afterEach(async () => {
        // Clean up routines created in this test
        for (const routineId of trackRoutines) {
            try {
                await routinesApi.deleteRoutine(routineId);
            } catch (error) {
                console.error(`Failed to delete routine ${routineId}:`, error);
            }
        }
    });

    context('When creating snapshot from UI', () => {
        it('should capture updated workout day sets when creating snapshot after adding another workout day', async () => {
            const routineName = kit.generateRandomString(5);
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: 'test update routine workout days set',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);
            
            console.log(`[Test 1] Created routine: ID=${routine.data.id}, Name=${routineName}`);

            // Create initial workout day with sets via API
            const workoutDay1 = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: 'Monday Upper',
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay1.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay1.data.id,
                muscleGroupId: MuscleGroupId.Back,
                numberOfSets: 3,
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay1.data.id,
                muscleGroupId: MuscleGroupId.Abductor,
                numberOfSets: 2,
            });

            await browser.activateApp(bundleId);

            // Add another workout day with the same muscle group (increases total sets) using fluent proxy
            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();
            
            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail
                .waitForScreen()
                .addWorkoutDay(
                    'Wednesday Upper',
                    2,
                    '3 sets of chest',
                    '2 sets of back',
                )
                .execute();
            
            // Wait for screen to update
            await browser.pause(1000);
            
            // Create snapshot from UI (should capture both workout days) using fluent proxy
            await routineDetail.tapCreateSnapshot().waitForSnapshotCreationComplete().execute();
            
            // Navigate back to routines list using fluent proxy
            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();
            
            // View report and verify aggregated totals using fluent proxy
            // Chest: 4 (Monday) + 3 (Wednesday) = 7
            // Back: 3 (Monday) + 2 (Wednesday) = 5
            // Abductor: 2 (Monday) + 0 (Wednesday) = 2
            console.log(`[Test 1] Navigating to report for routine: ID=${routine.data.id}, Name=${routineName}`);
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();
            
            const weeklyReport = createFluentWeeklyReportPage();
            await weeklyReport.waitForScreen().execute();
            await weeklyReport.verifyMuscleGroupTotal('Chest', 7).execute();
            await weeklyReport.verifyMuscleGroupTotal('Back', 5).execute();
            await weeklyReport.verifyMuscleGroupTotal('Abductor', 2).execute();
        });

        it('should capture updated workout day sets when creating snapshot after editing existing workout day', async () => {
            const routineName = kit.generateRandomString(5);
            const routine = await routinesApi.createRoutine({
                name: routineName,
                description: 'Test routine for snapshot after edit',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);
            
            console.log(`[Test 2] Created routine: ID=${routine.data.id}, Name=${routineName}`);

            // Create initial workout day with sets via API
            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 1,
                dayName: 'Monday Upper',
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Chest,
                numberOfSets: 4,
            });

            await workoutDaySetsApi.createWorkoutDaySet({
                workoutDayId: workoutDay.data.id,
                muscleGroupId: MuscleGroupId.Abductor,
                numberOfSets: 3,
            });

            await browser.activateApp(bundleId);
            
            // Navigate to routine detail using fluent proxy
            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapRoutineItem(routine.data.name).execute();
            
            // Edit existing workout day to increase sets (4 -> 6) using fluent proxy
            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail
                .waitForScreen()
                .editWorkoutDaySet(workoutDay.data.dayName, MuscleGroupId.Chest, 6)
                .execute();
            
            // Verify the edit was successful before creating snapshot
            await routineDetail.verifyWorkoutDaySet(workoutDay.data.dayName, 'Chest', 6).execute();
            
            // Create snapshot from UI (should capture updated sets: 6) using fluent proxy
            await routineDetail.tapCreateSnapshot().waitForSnapshotCreationComplete().execute();
            
            // Navigate back to routines list using fluent proxy
            await routineDetail.tapBack().execute();
            await myRoutines.waitForScreen().execute();
            
            // View report and verify updated total (6 sets, not 4) using fluent proxy
            // Use the routine name instead of ID to ensure we're viewing the correct routine's report
            // This is more reliable when tests run together as it avoids ID confusion
            console.log(`[Test 2] Navigating to report for routine: ID=${routine.data.id}, Name=${routineName}`);
            await myRoutines.waitForScreen().tapReportButtonByName(routineName).execute();
            
            const weeklyReport = createFluentWeeklyReportPage();
            await weeklyReport.waitForLoadingToComplete().execute();
            await weeklyReport.verifyMuscleGroupTotal('Chest', 6).execute();
            await weeklyReport.verifyMuscleGroupTotal('Abductor', 3).execute();
        });
    });
});

