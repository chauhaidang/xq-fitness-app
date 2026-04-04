import { $ } from '@wdio/globals';

/**
 * Object definitions for the "Weekly Report" screen
 * Contains only selectors/objects - no actions
 */
class WeeklyReportObjects {
    public get screenTitle() {
        return $('~Weekly Report');
    }

    public get weeklyReportScreen() {
        return $('~weekly-report-screen');
    }

    public get loadingContainer() {
        return $('~loading-container');
    }

    public get loadingIndicator() {
        return $('~loading-indicator');
    }

    public get errorContainer() {
        return $('~error-container');
    }

    public get reloadButton() {
        return $('~reload-button');
    }

    public get emptyState() {
        return $('~empty-state');
    }

    public get scrollView() {
        return $('~weekly-report-scroll-view');
    }

    /**
     * Get muscle group card by muscle group ID
     * @param muscleGroupId The muscle group ID (1-12)
     */
    public getMuscleGroupCard(muscleGroupId: number) {
        return $(`~muscle-group-${muscleGroupId}`);
    }

    /**
     * Get muscle group card by index
     * @param index The index of the muscle group in the list (0-based)
     */
    public getMuscleGroupCardByIndex(index: number) {
        return $(`//XCUIElementTypeOther[@name="muscle-group-"][${index + 1}]`);
    }

    /**
     * Get muscle group element by muscle group name
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     */
    public getMuscleGroupByName(muscleGroupName: string) {
        return $(`//XCUIElementTypeOther[contains(@name, "muscle-group-") and contains(@label, "${muscleGroupName}")]`);
    }

    /**
     * Get sets text element by expected sets count within a specific muscle group
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     * @param expectedSets The expected number of sets
     */
    public getSetsTextForMuscleGroup(muscleGroupName: string, expectedSets: number) {
        return $(`//XCUIElementTypeOther[contains(@name, "muscle-group-") and contains(@label, "${muscleGroupName}") and contains(@label, "${expectedSets} sets")]`);
    }

    /**
     * Get sets text element by expected sets count (legacy method for backward compatibility)
     * @param expectedSets The expected number of sets
     */
    public getSetsText(expectedSets: number) {
        return $(`//XCUIElementTypeStaticText[contains(@label, "${expectedSets}")]`);
    }

    /**
     * Get back button
     */
    public get backButton() {
        return $('//XCUIElementTypeButton[contains(@name, "back")]');
    }

    /**
     * Get exercise totals section container
     */
    public get exerciseTotalsSection() {
        return $('~exercise-totals-section');
    }

    /**
     * Get the reps progress badge for a specific exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getRepProgressBadge(exerciseName: string) {
        return $(`~progress-badge-rep-${exerciseName}`);
    }

    /**
     * Get the weight progress badge for a specific exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getWeightProgressBadge(exerciseName: string) {
        return $(`~progress-badge-weight-${exerciseName}`);
    }

    /**
     * Get exercise total item by exercise name
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getExerciseTotalByName(exerciseName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]`);
    }

    /**
     * Get exercise total item by index
     * @param index The index of the exercise total in the list (0-based)
     */
    public getExerciseTotalByIndex(index: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-")][${index + 1}]`);
    }

    /**
     * Get exercise name text within an exercise total item
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public getExerciseNameText(exerciseName: string) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${exerciseName}")]`);
    }

    /**
     * Get total reps text for an exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param totalReps The expected total reps value
     */
    public getTotalRepsText(exerciseName: string, totalReps: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${totalReps}")]`);
    }

    /**
     * Get weight (kg) text for an exercise
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param weightKg The expected weight value (kg)
     */
    public getWeightKgText(exerciseName: string, weightKg: number) {
        return $(`//XCUIElementTypeOther[starts-with(@name, "exercise-total-") and contains(@label, "${exerciseName}")]//XCUIElementTypeStaticText[contains(@label, "${weightKg}")]`);
    }
}

export default new WeeklyReportObjects();

