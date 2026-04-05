import RoutineDetailPage, { createFluentRoutineDetailPage } from './page-objects/routine-detail.page.js';
import { createFluentMyRoutinesPage } from './page-objects/my-routines.page.js';
import { createFluentCreateRoutinePage } from './page-objects/create-routine.page.js';
import * as kit from '@chauhaidang/xq-common-kit';
import {Configuration, RoutinesApi, WorkoutDaysApi, WorkoutDaySetsApi} from 'xq-fitness-write-client';
import { MuscleGroupId } from './enum.js';

describe('Manage Routine', () => {
    let routinesApi: RoutinesApi;
    let workoutDaysApi: WorkoutDaysApi;
    let workoutDaySetsApi: WorkoutDaySetsApi;
    let trackRoutines: number[] = [];
    let trackRoutineNames: string[] = [];
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
        trackRoutineNames = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    afterEach(async () => {
        // Clean up UI-created routines (by name)
        if (trackRoutineNames.length > 0) {
            try {
                // Navigate back if we're on RoutineDetailPage
                if (await RoutineDetailPage.isScreenDisplayed()) {
                    await RoutineDetailPage.tapBack();
                    await browser.pause(500);
                }
                
                // Delete each UI-created routine by name
                for (const routineName of trackRoutineNames) {
                    try {
                        const myRoutines = createFluentMyRoutinesPage();
                        await myRoutines.waitForScreen().tapDeleteRoutine(routineName).execute();
                    } catch (e) {
                        console.log(`Failed to delete routine by name: ${routineName}`, e);
                    }
                }
            } catch (e) {
                console.log('Error during UI routine cleanup:', e);
            }
        }
        
        // Clean up API-created routines (by ID)
        for (const routineId of trackRoutines) {
            try {
                await routinesApi.deleteRoutine(routineId);
            } catch (e) {
                console.log(`Failed to delete routine by ID: ${routineId}`, e);
            }
        }
    });

    context('When there is no routine', () => {
        const routineName = 'UL4' + kit.generateRandomString(5);
        const routineDescription = 'Upper Lower 4 days split';

        it('should let me create new routine with detail splits', async () => {
            // Track this routine name for cleanup
            trackRoutineNames.push(routineName);
            
            await browser.activateApp(bundleId);
            
            // Create routine using fluent proxy
            const myRoutines = createFluentMyRoutinesPage();
            await myRoutines.waitForScreen().tapCreateRoutine().execute();
            
            const createRoutine = createFluentCreateRoutinePage();
            await createRoutine
                .waitForScreen()
                .enterRoutineName(routineName)
                .enterRoutineDescription(routineDescription)
                .verifyToggleIsActive()
                .tapCreate()
                .closePopup()
                .execute();
            
            // Verify routine exists
            await myRoutines.waitForScreen().verifyRoutineExists(routineName).execute();
            
            // Add workout day using fluent proxy
            await myRoutines.waitForScreen().tapRoutineItem(routineName).execute();
            
            const routineDetail = createFluentRoutineDetailPage();
            await routineDetail
                .waitForScreen()
                .addWorkoutDay(
                    'Monday upper body',
                    '4 sets of chest',
                    '2 sets of back',
                    '3 sets of abductor',
                )
                .execute();
            
            // Verify workout day sets
            await routineDetail.verifyWorkoutDaySet('Monday upper body', 'Chest', 4).execute();
            await routineDetail.verifyWorkoutDaySet('Monday upper body', 'Back', 2).execute();
            await routineDetail.verifyWorkoutDaySet('Monday upper body', 'Abductor', 3).execute();
        });
    });

    context('When there is a routine', () => {
        it('should let me update the routine workout days set', async () => {
            const routine = await routinesApi.createRoutine({
                name: 'UL4' + kit.generateRandomString(5),
                description: 'test update routine workout days set',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);

            const workoutDay = await workoutDaysApi.createWorkoutDay({
                routineId: routine.data.id,
                dayNumber: 2,
                dayName: 'Wednesday Upper A',
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
            
            // Verify workout day set directly on Routine Details screen (we're already here)
            await routineDetail.verifyWorkoutDaySet(workoutDay.data.dayName, 'Chest', 6).execute();
            await routineDetail.verifyWorkoutDaySet(workoutDay.data.dayName, 'Abductor', 3).execute();
        });
    });
});
