import { screen } from '@chauhaidang/xq-test-utils';

const { by } = screen;

const MUSCLE_GROUP_NAME_TO_ID: Record<string, number> = {
    chest: 1, back: 2, shoulders: 3, shoulder: 3,
    biceps: 4, bicep: 4, triceps: 5, tricep: 5,
    forearms: 6, forearm: 6, quadriceps: 7, quad: 7,
    hamstrings: 8, hamstring: 8, glutes: 9, glute: 9,
    calves: 10, calf: 10, abs: 11, ab: 11,
    'lower back': 12, lowerback: 12, abductor: 13,
};

class ManageExercisePage {
    async waitForScreen() {
        await screen.waitFor(by.id('manage-exercise-screen')).toBeVisible({ timeout: 10_000 });
        return this;
    }

    async enterExerciseName(exerciseName: string) {
        await screen.waitFor(by.id('exercise-name-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('exercise-name-input')).replaceText(exerciseName);
        return this;
    }

    async enterTotalReps(totalReps: number) {
        await screen.waitFor(by.id('total-reps-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('total-reps-input')).replaceText(totalReps.toString());
        return this;
    }

    async enterWeight(weight: number) {
        await screen.waitFor(by.id('weight-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('weight-input')).replaceText(weight.toString());
        return this;
    }

    async enterTotalSets(totalSets: number) {
        // Swipe up on the form to reveal the field below the keyboard fold
        try {
            await screen.element(by.id('exercise-form')).swipe('up', 'slow', 0.3);
        } catch {
            // swipe may fail if already at bottom or element not found
        }
        await screen.waitFor(by.id('total-sets-input')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('total-sets-input')).replaceText(totalSets.toString());
        return this;
    }

    async enterNotes(notes: string) {
        try {
            await screen.waitFor(by.id('exercise-notes-input')).toBeVisible({ timeout: 3_000 });
            await screen.element(by.id('manage-exercise-screen')).scroll(150, 'up');
            await screen.element(by.id('exercise-notes-input')).replaceText(notes);
        } catch {
            // notes field not present or not visible, skip gracefully
        }
        return this;
    }

    async tapSave() {
        // Dismiss keyboard by tapping a non-input label
        try {
            await screen.element(by.label('Notes (optional)')).tap();
        } catch {
            try {
                await screen.element(by.label('Notes')).tap();
            } catch {
                // keyboard may already be dismissed
            }
        }
        await screen.waitFor(by.id('exercise-submit-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('exercise-submit-button')).tap();

        // Handle confirmation alert if present
        try {
            await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 5_000 });
            await screen.element(by.text('OK')).tap();
        } catch {
            // no alert
        }
        return this;
    }

    async tapCancel() {
        await screen.waitFor(by.id('exercise-cancel-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('exercise-cancel-button')).tap();
        return this;
    }

    async tapDelete() {
        await screen.waitFor(by.id('delete-exercise-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('delete-exercise-button')).tap();
        // Handle confirmation alert
        try {
            await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 2_000 });
            await screen.element(by.text('OK')).tap();
        } catch {
            // no alert
        }
        return this;
    }

    /**
     * Tap the add button for a specific muscle group.
     * @param muscleGroupName e.g. "Chest", "Back"
     */
    async tapAddExerciseForMuscleGroup(muscleGroupName: string) {
        const normalized = muscleGroupName.toLowerCase().trim();
        const id = MUSCLE_GROUP_NAME_TO_ID[normalized];
        if (id === undefined) {
            throw new Error(`Unknown muscle group: "${muscleGroupName}"`);
        }
        await screen.waitFor(by.id(`add-exercise-button-${id}`)).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id(`add-exercise-button-${id}`)).tap();
        return this;
    }

    async tapBack() {
        await screen.element(by.label('Routine Details, back')).tap();
        return this;
    }
}

export default new ManageExercisePage();
