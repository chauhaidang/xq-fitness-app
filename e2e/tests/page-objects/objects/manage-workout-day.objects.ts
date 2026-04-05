import { $ } from '@wdio/globals';
import { MuscleGroupId } from '../../enum.js';

/**
 * Object definitions for the "Manage Workout Day" screen
 * Contains only selectors/objects - no actions
 */
class ManageWorkoutDayObjects {
    public get backButton() {
        return $('~Routine Details, back');
    }

    public get screenTitle() {
        return $('~Manage Workout Day');
    }

    /**
     * Get day number input
     */
    public get dayNumberInput() {
        return $('~day-number-input');
    }

    /**
     * Get day name input
     */
    public get dayNameInput() {
        return $('~day-name-input');
    }

    /**
     * Get notes label
     */
    public get notesLabel() {
        return $('~Notes');
    }

    /**
     * Get first muscle group container
     */
    public get firstMuscleGroupContainer() {
        return $('~muscle-group-1');
    }

    /**
     * Get first sets input
     */
    public get firstSetsInput() {
        return $('~sets-input-1');
    }

    /**
     * Get the sets input for a specific muscle group
     * @param muscleGroupId The muscle group ID (1-13)
     */
    public getSetsInputForMuscleGroup(muscleGroupId: MuscleGroupId) {
        return $(`~sets-input-${muscleGroupId}`);
    }

    /**
     * Get save workout day button
     */
    public get saveWorkoutDayButton() {
        return $('//XCUIElementTypeOther[@name="submit-button" or @label="Create Workout Day" or @label="Update Workout Day"]');
    }

    /**
     * Get manage workout day screen
     */
    public get manageWorkoutDayScreen() {
        return $('~manage-workout-day-screen');
    }
}

export default new ManageWorkoutDayObjects();

