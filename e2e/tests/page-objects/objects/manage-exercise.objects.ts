import { $ } from '@wdio/globals';

/**
 * Map muscle group names to IDs (testID: add-exercise-button-{id} from ManageExerciseScreen.js)
 */
const MUSCLE_GROUP_NAME_TO_ID: Record<string, number> = {
    chest: 1, back: 2, shoulders: 3, shoulder: 3,
    biceps: 4, bicep: 4, triceps: 5, tricep: 5,
    forearms: 6, forearm: 6, quadriceps: 7, quad: 7,
    hamstrings: 8, hamstring: 8, glutes: 9, glute: 9,
    calves: 10, calf: 10, abs: 11, ab: 11,
    'lower back': 12, lowerback: 12, abductor: 13,
};

/**
 * Object definitions for the "Manage Exercise" screen
 * Contains only selectors/objects - no actions
 */
class ManageExerciseObjects {
    public get screenTitle() {
        return $('~Manage Exercise');
    }

    public get manageExerciseScreen() {
        return $('~manage-exercise-screen');
    }

    public get exerciseNameInput() {
        return $('~exercise-name-input');
    }

    public get totalRepsInput() {
        return $('~total-reps-input');
    }

    public get weightInput() {
        return $('~weight-input');
    }

    public get totalSetsInput() {
        return $('~total-sets-input');
    }

    /** Notes input - testID from ExerciseForm.js is "exercise-notes-input" */
    public get notesInput() {
        return $('~exercise-notes-input');
    }

    /** Notes label - used to dismiss keyboard before tapping save */
    public get notesLabel() {
        return $('~Notes');
    }

    /** Notes (optional) label - alternate label on Manage Exercise screen */
    public get notesOptionalLabel() {
        return $('~Notes (optional)');
    }

    /** Submit button in ExerciseForm (Add/Update) */
    public get saveButton() {
        return $('~exercise-submit-button');
    }

    /** Single "+ Add Exercise" button at top (Manage Exercise, when form is hidden) */
    public get addExerciseButton() {
        return $('~add-exercise-button');
    }

    /** Cancel button - testID from ExerciseForm.js is "exercise-cancel-button" */
    public get cancelButton() {
        return $('~exercise-cancel-button');
    }

    public get deleteButton() {
        return $('~delete-exercise-button');
    }

    public get backButton() {
        return $('//XCUIElementTypeButton[contains(@name, "back")]');
    }

    /**
     * Get the "+ Add" button for a specific muscle group on Manage Exercise screen.
     * Each muscle group row has add-exercise-button-{muscleGroupId} (testID from ManageExerciseScreen.js).
     * @param muscleGroupName The muscle group name (e.g., "Chest", "Back")
     */
    public getAddExerciseButtonForMuscleGroup(muscleGroupName: string) {
        const normalized = muscleGroupName.toLowerCase().trim();
        const id = MUSCLE_GROUP_NAME_TO_ID[normalized];
        if (id === undefined) {
            throw new Error(`Unknown muscle group: "${muscleGroupName}". Available: ${Object.keys(MUSCLE_GROUP_NAME_TO_ID).join(', ')}`);
        }
        return $(`~add-exercise-button-${id}`);
    }

    /**
     * Get exercise list item by exercise name within a muscle group on Manage Exercise screen.
     * Uses testID pattern exercise-item-{id} and label containing exercise name.
     * Scoped to muscle group section for precision when multiple muscle groups have similar exercises.
     * @param _muscleGroupName The muscle group name (reserved for future scoping)
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getExerciseItem(_muscleGroupName: string, exerciseName: string) {
        return $(`//XCUIElementTypeOther[contains(@name, "exercise-item-") and contains(@label, "${exerciseName}")]`);
    }
}

export default new ManageExerciseObjects();
