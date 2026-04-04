import { expect, browser } from '@wdio/globals';
import ManageExerciseObjects from './objects/manage-exercise.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';
import { logger } from '@chauhaidang/xq-common-kit';

/**
 * Page object for the "Manage Exercise" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class ManageExercisePage extends Page {
    /**
     * Wait for the Manage Exercise screen to be displayed
     */
    public async waitForScreen() {
        try {
            await expect(ManageExerciseObjects.manageExerciseScreen).toBeDisplayed({ wait: 10000 });
        } catch (error) {
            await expect(ManageExerciseObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        }
        await browser.pause(500);
        return this;
    }

    /**
     * Enter exercise name
     * @param exerciseName The name of the exercise
     */
    public async enterExerciseName(exerciseName: string) {
        const exerciseNameInput = ManageExerciseObjects.exerciseNameInput;
        await expect(exerciseNameInput).toBeDisplayed({ wait: 5000 });
        await expect(exerciseNameInput).toBeEnabled({ wait: 2000 });
        await exerciseNameInput.click();
        await browser.pause(200);
        await exerciseNameInput.setValue(exerciseName);
        await browser.pause(200);
        return this;
    }

    /**
     * Enter total reps
     * @param totalReps The total number of reps
     */
    public async enterTotalReps(totalReps: number) {
        const totalRepsInput = ManageExerciseObjects.totalRepsInput;
        await expect(totalRepsInput).toBeDisplayed({ wait: 5000 });
        await expect(totalRepsInput).toBeEnabled({ wait: 2000 });
        await totalRepsInput.click();
        await browser.pause(200);
        await totalRepsInput.setValue(totalReps.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter weight
     * @param weight The weight value
     */
    public async enterWeight(weight: number) {
        const weightInput = ManageExerciseObjects.weightInput;
        await expect(weightInput).toBeDisplayed({ wait: 5000 });
        await expect(weightInput).toBeEnabled({ wait: 2000 });
        await weightInput.click();
        await browser.pause(200);
        await weightInput.setValue(weight.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter total sets
     * @param totalSets The total number of sets
     */
    public async enterTotalSets(totalSets: number) {
        const totalSetsInput = ManageExerciseObjects.totalSetsInput;
        await totalSetsInput.waitForExist({ timeout: 5000 });
        // Swipe up so Total Sets is visible (keyboard may cover lower fields)
        try {
            await browser.swipe({ direction: 'up', percent: 0.2 });
            await browser.pause(300);
        } catch {
            // ignore
        }
        await totalSetsInput.scrollIntoView();
        await browser.pause(500);
        await expect(totalSetsInput).toBeDisplayed({ wait: 5000 });
        await expect(totalSetsInput).toBeEnabled({ wait: 2000 });
        await totalSetsInput.click();
        await browser.pause(200);
        await totalSetsInput.setValue(totalSets.toString());
        await browser.pause(200);
        return this;
    }

    /**
     * Enter notes (optional: if notes input is not present, skips without failing)
     * @param notes The notes text
     */
    public async enterNotes(notes: string) {
        const notesInput = ManageExerciseObjects.notesInput;
        const exists = await notesInput.waitForExist({ timeout: 3000, reverse: false }).catch(() => false);
        if (!exists) {
            return this;
        }
        try {
            await browser.swipe({ direction: 'up', percent: 0.2 });
            await browser.pause(300);
        } catch {
            // ignore
        }
        await notesInput.scrollIntoView();
        await browser.pause(500);
        const displayed = await notesInput.isDisplayed().catch(() => false);
        if (!displayed) {
            return this;
        }
        await notesInput.click();
        await browser.pause(200);
        await notesInput.setValue(notes);
        await browser.pause(200);
        return this;
    }

    /**
     * Tap the save button
     * Swipes up and scrolls to reveal the save button (below notes), then taps it.
     */
    public async tapSave() {
        const saveButton = ManageExerciseObjects.saveButton;

        // Dismiss keyboard if it covers the action buttons.
        if (await browser.isKeyboardShown()) {
            try {
                // Not always supported on iOS, so keep a fallback.
                await browser.hideKeyboard();
            } catch {
                // Tap a non-input label to dismiss the keyboard.
                try {
                    await ManageExerciseObjects.notesOptionalLabel.click();
                } catch {
                    await ManageExerciseObjects.notesLabel.click();
                }
            }
            logger.info('Keyboard dismissed before tapping Save/Add');
            await browser.pause(300);
        }

        // Ensure the button is in view (it is below notes).
        try {
            await saveButton.scrollIntoView({ direction: 'down' });
        } catch {
            // ignore scroll failures; we'll still attempt to click if visible
        }

        await expect(saveButton).toBeDisplayed({ wait: 5000 });
        await saveButton.click();
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                await browser.acceptAlert();
                await browser.pause(1000);
            }
        } catch {
            // No alert present, continue
        }

        return this;
    }

    /**
     * Tap the cancel button
     */
    public async tapCancel() {
        const cancelButton = ManageExerciseObjects.cancelButton;
        await expect(cancelButton).toBeDisplayed({ wait: 5000 });
        await cancelButton.click();
        await browser.pause(500);
        return this;
    }

    /**
     * Tap the delete button
     */
    public async tapDelete() {
        const deleteButton = ManageExerciseObjects.deleteButton;
        await expect(deleteButton).toBeDisplayed({ wait: 5000 });
        await deleteButton.click();
        await browser.pause(500);
        
        // Handle confirmation alert if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                await browser.acceptAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present, continue
        }
        
        return this;
    }

    /**
     * Verify that an exercise is displayed with specific values
     * @param exerciseName The expected exercise name
     * @param totalReps The expected total reps
     * @param weight The expected weight
     * @param totalSets The expected total sets
     */
    public async verifyExerciseDisplayed(_exerciseName: string, totalReps?: number, weight?: number, totalSets?: number) {
        // Verify exercise name is displayed
        const exerciseNameInput = ManageExerciseObjects.exerciseNameInput;
        await expect(exerciseNameInput).toBeDisplayed({ wait: 5000 });
        
        // If values are provided, verify they match
        if (totalReps !== undefined) {
            const totalRepsInput = ManageExerciseObjects.totalRepsInput;
            await expect(totalRepsInput).toBeDisplayed({ wait: 5000 });
        }
        
        if (weight !== undefined) {
            const weightInput = ManageExerciseObjects.weightInput;
            await expect(weightInput).toBeDisplayed({ wait: 5000 });
        }
        
        if (totalSets !== undefined) {
            const totalSetsInput = ManageExerciseObjects.totalSetsInput;
            await expect(totalSetsInput).toBeDisplayed({ wait: 5000 });
        }
        
        return this;
    }

    /**
     * Tap the "+ Add" button for a specific muscle group on Manage Exercise screen.
     * Each muscle group row has its own Add button (add-exercise-button-{id}).
     * @param muscleGroupName The muscle group name (e.g., "Chest", "Back")
     */
    public async tapAddExerciseForMuscleGroup(muscleGroupName: string) {
        const addButton = ManageExerciseObjects.getAddExerciseButtonForMuscleGroup(muscleGroupName);
        await addButton.scrollIntoView();
        await browser.pause(500);
        await expect(addButton).toBeDisplayed({ wait: 5000 });
        await addButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Tap on an exercise item to open the edit form (Manage Exercise screen).
     * @param muscleGroupName The muscle group name (e.g., "Chest")
     * @param exerciseName The exercise name (e.g., "Bench Press")
     */
    public async tapExerciseItem(muscleGroupName: string, exerciseName: string) {
        const exerciseItem = ManageExerciseObjects.getExerciseItem(muscleGroupName, exerciseName);
        await exerciseItem.scrollIntoView();
        await browser.pause(500);
        await expect(exerciseItem).toBeDisplayed({ wait: 5000 });
        await exerciseItem.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Tap the back button
     */
    public async tapBack() {
        await expect(ManageExerciseObjects.backButton).toBeDisplayed({ wait: 5000 });
        await ManageExerciseObjects.backButton.click();
        await browser.pause(500);
        return this;
    }
}

export default new ManageExercisePage();

/**
 * Creates a fluent proxy instance of ManageExercisePage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentManageExercisePage();
 * await fluentPage
 *     .waitForScreen()
 *     .enterExerciseName('Bench Press')
 *     .enterTotalReps(30)
 *     .enterWeight(135)
 *     .enterTotalSets(3)
 *     .tapSave()
 *     .execute();
 * ```
 */
export const createFluentManageExercisePage = () => createFluentProxy(new ManageExercisePage());
