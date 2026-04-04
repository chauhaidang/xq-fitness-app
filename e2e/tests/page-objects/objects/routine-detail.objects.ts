import { $ } from '@wdio/globals';
import { MuscleGroupId } from '../../enum.js';

/**
 * Object definitions for the "Routine Detail" screen
 * Contains only selectors/objects - no actions
 */
class RoutineDetailObjects {
    public get screenTitle() {
        return $('~Routine Details');
    }

    public get routineDetailScreen() {
        return $('~routine-detail-screen');
    }

    public get addWorkoutDayButton() {
        return $('~add-workout-day-button');
    }

    public get addFirstDayButton() {
        return $('~add-first-day-button');
    }

    public get backButton() {
        return $('//XCUIElementTypeButton[@name="My Routines, back"]');
    }

    /**
     * Get the edit button for a specific workout day by day name
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     */
    public getEditButtonForDay(dayName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//XCUIElementTypeOther[starts-with(@name, "edit-day-")]`);
    }

    /**
     * Get the delete button for a specific workout day by day name
     * @param dayName The day name (e.g., "Day 2: Wednesday Upper A")
     */
    public getDeleteButtonForDay(dayName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//XCUIElementTypeOther[starts-with(@name, "delete-day-")]`);
    }

    /**
     * Get the muscle group container element for a specific muscle group and day (Routine Detail screen).
     * Routine Detail shows muscle group totals as "Muscle Groups:" with rows like "Chest" and "6 sets".
     * Uses label containment for flexibility with iOS accessibility aggregation.
     * @param dayName The day name (e.g., "Monday Push Day" or "Day 1: Monday Push Day")
     * @param muscleGroupName The muscle group name (e.g., "Chest")
     * @param numberOfSets The number of sets (e.g., 6)
     */
    public getMuscleGroupContainerForDay(dayName: string, muscleGroupName: string, numberOfSets: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//*[contains(@label, "${muscleGroupName}") and contains(@label, "${numberOfSets} sets")]`);
    }

    /**
     * Get the sets input for a specific muscle group (for editing)
     * @param muscleGroupId The muscle group ID (1-12)
     */
    public getSetsInputForMuscleGroup(muscleGroupId: MuscleGroupId) {
        return $(`~sets-input-${muscleGroupId}`);
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
     * Get save workout day button
     */
    public get saveWorkoutDayButton() {
        return $('//XCUIElementTypeOther[@name="submit-button" or @label="Create Workout Day" or @label="Update Workout Day"]');
    }

    /**
     * Get create snapshot button
     */
    public get createSnapshotButton() {
        return $('~create-snapshot-button');
    }

    /**
     * Get the "Exercises" button for a workout day (navigates to Manage Exercise screen).
     * Routine Detail has one Exercises button per workout day (testID: exercises-day-{id}).
     * @param dayName The day name (e.g., "Monday Push Day" matches "Day 1: Monday Push Day")
     */
    public getExercisesButtonForDay(dayName: string) {
        return $(`//*[starts-with(@name, "workout-day-") and contains(@label, "${dayName}")]//*[starts-with(@name, "exercises-day-")]`);
    }

}

export default new RoutineDetailObjects();
