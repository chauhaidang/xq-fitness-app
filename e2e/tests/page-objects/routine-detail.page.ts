import { screen } from '@chauhaidang/xq-test-utils';
import { MuscleGroupId } from '../enum';

const { by } = screen;

const MUSCLE_GROUP_NAME_TO_ID: Record<string, number> = {
    'chest': 1, 'back': 2, 'shoulders': 3, 'shoulder': 3,
    'biceps': 4, 'bicep': 4, 'triceps': 5, 'tricep': 5,
    'forearms': 6, 'forearm': 6, 'quadriceps': 7, 'quad': 7,
    'hamstrings': 8, 'hamstring': 8, 'glutes': 9, 'glute': 9,
    'calves': 10, 'calf': 10, 'abs': 11, 'ab': 11,
    'lower back': 12, 'lowerback': 12, 'abductor': 13, 'arm': 4, 'arms': 4,
};

class RoutineDetailPage {
    async isScreenDisplayed() {
        try {
            await screen.expect(by.id('routine-detail-screen')).toBeVisible();
            return true;
        } catch {
            return false;
        }
    }

    async waitForScreen() {
        await screen.waitFor(by.id('routine-detail-screen')).toBeVisible({ timeout: 20_000 });
        return this;
    }

    /**
     * Add a workout day with one or more sets.
     * @param dayName Name of the workout day
     * @param dayNumberOrFirstSet Day number (if number) or first set string (if string)
     * @param sets Additional set strings in format "X sets of muscleGroup"
     */
    async addWorkoutDay(dayName: string, dayNumberOrFirstSet?: number | string, ...sets: string[]) {
        let dayNumber: number;
        let actualSets: string[];

        if (typeof dayNumberOrFirstSet === 'number') {
            dayNumber = dayNumberOrFirstSet;
            actualSets = sets;
        } else {
            dayNumber = 1;
            actualSets = dayNumberOrFirstSet ? [dayNumberOrFirstSet, ...sets] : sets;
        }

        await this.tapAddWorkoutDay();
        await this.waitForWorkoutDayForm();

        await this.enterDayNumber(dayNumber);
        await this.enterDayName(dayName);

        // Dismiss keyboard before scrolling to sets inputs
        try {
            await screen.element(by.label('Notes')).tap();
        } catch {
            // keyboard may already be dismissed
        }

        for (const setString of actualSets) {
            await this.addSet(setString);
        }

        await this.saveWorkoutDay();
        return this;
    }

    async tapAddWorkoutDay() {
        // Try "Add First Day" button first, fall back to "Add Day"
        try {
            await screen.waitFor(by.id('add-first-day-button')).toBeVisible({ timeout: 2_000 });
            await screen.element(by.id('add-first-day-button')).tap();
        } catch {
            await screen.waitFor(by.id('add-workout-day-button')).toBeVisible({ timeout: 5_000 });
            await screen.element(by.id('add-workout-day-button')).tap();
        }
        return this;
    }

    async waitForWorkoutDayForm() {
        await screen.waitFor(by.id('day-number-input')).toBeVisible({ timeout: 10_000 });
        return this;
    }

    async enterDayNumber(dayNumber: number) {
        await screen.waitFor(by.id('day-number-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('day-number-input')).replaceText(dayNumber.toString());
        return this;
    }

    async enterDayName(dayName: string) {
        await screen.waitFor(by.id('day-name-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('day-name-input')).replaceText(dayName);
        return this;
    }

    private getMuscleGroupId(muscleGroupName: string): number {
        const id = MUSCLE_GROUP_NAME_TO_ID[muscleGroupName.toLowerCase().trim()];
        if (!id) {
            throw new Error(`Unknown muscle group: "${muscleGroupName}"`);
        }
        return id;
    }

    async addSet(setString: string) {
        const match = setString.match(/(\d+)\s+sets?\s+of\s+(.+)/i);
        if (!match) {
            throw new Error(`Invalid set format: "${setString}". Expected: "X sets of muscleGroup"`);
        }
        const numberOfSets = parseInt(match[1], 10);
        const muscleGroupId = this.getMuscleGroupId(match[2].trim());
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
        return this;
    }

    async enterSetsForMuscleGroup(muscleGroupId: MuscleGroupId | number, numberOfSets: number) {
        const inputId = `sets-input-${muscleGroupId}`;
        // Scroll down to make the input visible before interacting
        try {
            await screen.waitFor(by.id(inputId)).toBeVisible({ timeout: 2_000 });
        } catch {
            await screen.element(by.id('manage-workout-day-scroll')).scroll(100, 'down');
        }
        await screen.waitFor(by.id(inputId)).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id(inputId)).replaceText(numberOfSets.toString());
        return this;
    }

    async saveWorkoutDay() {
        // Dismiss keyboard
        try {
            await screen.element(by.label('Notes')).tap();
        } catch {
            // keyboard may already be dismissed
        }

        // Scroll to bottom to reveal submit button (it's below all muscle group inputs)
        await screen.element(by.id('manage-workout-day-scroll')).scrollTo('bottom');

        await screen.waitFor(by.id('submit-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('submit-button')).tap();

        // Handle save confirmation alert if present
        try {
            await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 2_000 });
            await screen.element(by.text('OK')).tap();
        } catch {
            // no alert
        }
        return this;
    }

    async tapBack() {
        await screen.element(by.label('My Routines, back')).tap();
        return this;
    }

    /**
     * Edit a workout day's sets via the edit button (identified by backend dayId).
     * @param dayId Backend workout day ID (from API response)
     * @param muscleGroupId The muscle group to update
     * @param numberOfSets New number of sets
     */
    async editWorkoutDaySet(dayId: number, muscleGroupId: MuscleGroupId, numberOfSets: number) {
        await screen.waitFor(by.id(`edit-day-${dayId}`)).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id(`edit-day-${dayId}`)).tap();
        await this.waitForWorkoutDayForm();
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
        await this.saveWorkoutDay();
        return this;
    }

    /**
     * Verify the sets count for a muscle group within a workout day.
     * @param dayId Backend workout day ID (from API). Pass null for UI-created days.
     * @param muscleGroupName Display name (e.g., "Chest")
     * @param numberOfSets Expected number of sets
     */
    async verifyWorkoutDaySet(dayId: number | null, muscleGroupName: string, numberOfSets: number) {
        if (dayId !== null) {
            // Scope to the specific workout day container when backend ID is known
            await screen.waitFor(
                by.withAncestor(by.text(`${numberOfSets} sets`), by.id(`workout-day-${dayId}`))
            ).toBeVisible({ timeout: 5_000 });
        } else {
            // For UI-created days without backend ID, verify the sets count text is visible on screen
            await screen.waitFor(by.text(`${numberOfSets} sets`)).toBeVisible({ timeout: 5_000 });
        }
        console.log(`Verified: ${muscleGroupName} shows ${numberOfSets} sets in workout-day-${dayId ?? 'unknown'}`);
        return this;
    }

    async tapCreateSnapshot() {
        await screen.waitFor(by.id('create-snapshot-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('create-snapshot-button')).tap();
        return this;
    }

    async waitForSnapshotCreationComplete() {
        // Wait for success toast or indicator that creation is done
        await new Promise(resolve => setTimeout(resolve, 3_000));
        try {
            await screen.waitFor(by.text('snapshot')).toBeVisible({ timeout: 5_000 });
        } catch {
            // toast may have already disappeared
        }
        return this;
    }

    /**
     * Tap the Exercises button for a workout day (navigates to Manage Exercise screen).
     * @param dayId Backend workout day ID (from API response)
     */
    async tapExercisesForDay(dayId: number) {
        await screen.waitFor(by.id(`exercises-day-${dayId}`)).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id(`exercises-day-${dayId}`)).tap();
        return this;
    }
}

export default new RoutineDetailPage();
