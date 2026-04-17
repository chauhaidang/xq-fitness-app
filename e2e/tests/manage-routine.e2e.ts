/**
 * Manage Routine — Detox E2E tests
 *
 * Covers:
 * 1. Create a new routine via UI with workout day splits
 * 2. Update an API-created routine's workout day sets via UI
 */
import * as kit from '@chauhaidang/xq-common-kit';
import {
    createRoutine,
    deleteRoutine,
    createWorkoutDay,
    createWorkoutDaySet,
} from '@chauhaidang/write-service-api';
import { createClient, createConfig } from '@hey-api/client-fetch';
import { MuscleGroupId } from './enum';
import MyRoutinesPage from './page-objects/my-routines.page';
import CreateRoutinePage from './page-objects/create-routine.page';
import RoutineDetailPage from './page-objects/routine-detail.page';

const BASE_URL = 'http://localhost:8080/xq-fitness-write-service/api/v1';

describe('Manage Routine', () => {
    let client: any;
    let trackRoutines: number[] = [];
    let trackRoutineNames: string[] = [];

    beforeEach(() => {
        client = createClient(createConfig({ baseUrl: BASE_URL }));
        trackRoutines = [];
        trackRoutineNames = [];
    });

    afterEach(async () => {
        // Navigate back to routine list for cleanup
        try {
            if (await RoutineDetailPage.isScreenDisplayed()) {
                await RoutineDetailPage.tapBack();
            }
        } catch { /* already on list */ }

        // Clean up UI-created routines by name
        for (const routineName of trackRoutineNames) {
            try {
                await MyRoutinesPage.waitForScreen();
                await MyRoutinesPage.tapDeleteRoutine(routineName);
            } catch (e) {
                console.log(`Failed to delete routine by name: ${routineName}`, e);
            }
        }

        // Clean up API-created routines by ID
        for (const routineId of trackRoutines) {
            try {
                await deleteRoutine({ client, path: { routineId } });
            } catch (e) {
                console.log(`Failed to delete routine by ID: ${routineId}`, e);
            }
        }
    });

    describe('When there is no routine', () => {
        const routineName = 'UL4' + kit.generateRandomString(5);
        const routineDescription = 'Upper Lower 4 days split';

        it('should let me create new routine with detail splits', async () => {
            trackRoutineNames.push(routineName);

            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapCreateRoutine();

            await CreateRoutinePage.waitForScreen();
            await CreateRoutinePage.enterRoutineName(routineName);
            await CreateRoutinePage.enterRoutineDescription(routineDescription);
            await CreateRoutinePage.verifyToggleIsActive();
            await CreateRoutinePage.tapCreate();
            await CreateRoutinePage.closePopup();

            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.verifyRoutineExists(routineName);
            await MyRoutinesPage.tapRoutineItem(routineName);

            await RoutineDetailPage.waitForScreen();
            await RoutineDetailPage.addWorkoutDay(
                'Monday upper body',
                '4 sets of chest',
                '2 sets of back',
                '3 sets of abductor',
            );

            // Verify workout day sets — no backend dayId available for UI-created day
            await RoutineDetailPage.verifyWorkoutDaySet(null, 'Chest', 4);
            await RoutineDetailPage.verifyWorkoutDaySet(null, 'Back', 2);
            await RoutineDetailPage.verifyWorkoutDaySet(null, 'Abductor', 3);
        });
    });

    describe('When there is a routine', () => {
        it('should let me update the routine workout days set', async () => {
            // API setup first so app sees routine when it re-focuses the list
            const routine = await createRoutine({
                client,
                body: {
                    name: 'UL4' + kit.generateRandomString(5),
                    description: 'test update routine workout days set',
                    isActive: true,
                },
            });
            trackRoutines.push(routine.data!.id);

            const workoutDay = await createWorkoutDay({
                client,
                body: {
                    routineId: routine.data!.id,
                    dayNumber: 2,
                    dayName: 'Wednesday Upper A',
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

            // useFocusEffect triggers a refresh when the list screen regains focus
            await MyRoutinesPage.waitForScreen();
            await MyRoutinesPage.tapRoutineItem(routine.data!.name);

            await RoutineDetailPage.waitForScreen();
            // Edit Chest sets 4 → 6 using the backend dayId for reliable element targeting
            await RoutineDetailPage.editWorkoutDaySet(workoutDay.data!.id, MuscleGroupId.Chest, 6);

            // Verify updated sets on the Routine Detail screen
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, 'Chest', 6);
            await RoutineDetailPage.verifyWorkoutDaySet(workoutDay.data!.id, 'Abductor', 3);
        });
    });
});
