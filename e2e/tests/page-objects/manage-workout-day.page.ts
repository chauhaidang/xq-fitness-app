import { $, expect, browser } from '@wdio/globals';
import ManageWorkoutDayObjects from './objects/manage-workout-day.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';

/**
 * Page object for the "Manage Workout Day" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class ManageWorkoutDayPage extends Page {
    public async tapBack() {
        await ManageWorkoutDayObjects.backButton.click();
        return this;
    }
    public async isScreenDisplayed() : Promise<boolean> {
        return ManageWorkoutDayObjects.screenTitle.isDisplayed();
    }

    /**
     * Wait for the Manage Workout Day screen to be displayed
     */
    public async waitForScreen() {
        await expect(ManageWorkoutDayObjects.dayNumberInput).toBeDisplayed({ wait: 10000 });
        await browser.pause(500);
        return this;
    }

    /**
     * Enter the day number
     * @param dayNumber The day number (1, 2, 3, etc.)
     */
    public async enterDayNumber(dayNumber: number) {
        let dayNumberInput = ManageWorkoutDayObjects.dayNumberInput;
        
        try {
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        } catch (e) {
            dayNumberInput = $('//XCUIElementTypeTextField[@name="day-number-input"]');
            await expect(dayNumberInput).toBeDisplayed({ wait: 5000 });
        }
        
        await expect(dayNumberInput).toBeEnabled({ wait: 2000 });
        await dayNumberInput.click();
        await browser.pause(600);
        await dayNumberInput.setValue(dayNumber.toString());
        await browser.pause(300);
        return this;
    }

    /**
     * Enter the workout day name
     * @param dayName The name of the workout day
     */
    public async enterDayName(dayName: string) {
        const dayNameInput = ManageWorkoutDayObjects.dayNameInput;
        await expect(dayNameInput).toBeDisplayed({ wait: 5000 });
        await expect(dayNameInput).toBeEnabled({ wait: 2000 });
        await dayNameInput.click();
        await browser.pause(200);
        await dayNameInput.setValue(dayName);
        await browser.pause(200);
        return this;
    }

    /**
     * Map muscle group names to their IDs
     */
    private getMuscleGroupId(muscleGroupName: string): number {
        const muscleGroupMap: { [key: string]: number } = {
            'chest': 1, 'back': 2, 'shoulders': 3, 'shoulder': 3,
            'biceps': 4, 'bicep': 4, 'triceps': 5, 'tricep': 5,
            'forearms': 6, 'forearm': 6, 'quadriceps': 7, 'quad': 7,
            'hamstrings': 8, 'hamstring': 8, 'glutes': 9, 'glute': 9,
            'calves': 10, 'calf': 10, 'abs': 11, 'ab': 11,
            'lower back': 12, 'lowerback': 12, 'abductor': 13, 'arm': 4, 'arms': 4
        };
        
        const normalizedName = muscleGroupName.toLowerCase().trim();
        const id = muscleGroupMap[normalizedName];
        
        if (!id) {
            throw new Error(`Unknown muscle group: "${muscleGroupName}". Available: ${Object.keys(muscleGroupMap).join(', ')}`);
        }
        
        return id;
    }

    /**
     * Add a set by parsing the set string
     * @param setString String in format "X sets of muscleGroup"
     */
    public async addSet(setString: string) {
        const match = setString.match(/(\d+)\s+sets?\s+of\s+(.+)/i);
        if (!match) {
            throw new Error(`Invalid set format: "${setString}". Expected format: "X sets of muscleGroup"`);
        }
        
        const numberOfSets = parseInt(match[1], 10);
        const muscleGroupName = match[2].trim();
        const muscleGroupId = this.getMuscleGroupId(muscleGroupName);
        
        await this.enterSetsForMuscleGroup(muscleGroupId, numberOfSets);
    }

    /**
     * Enter the number of sets for a specific muscle group
     * @param muscleGroupId The muscle group ID (1-13)
     * @param numberOfSets The number of sets
     */
    public async enterSetsForMuscleGroup(muscleGroupId: number, numberOfSets: number) {
        console.log(`Entering ${numberOfSets} sets for muscle group ${muscleGroupId}...`);
        const setsInput = ManageWorkoutDayObjects.getSetsInputForMuscleGroup(muscleGroupId);
        
        await setsInput.waitForExist({ timeout: 5000 });
        console.log(`Element exists for muscle group ${muscleGroupId}`);
        
        // Scroll to element BEFORE clicking to ensure it's visible above keyboard area
        // For muscle groups at the bottom (like Abductor ID: 13), we need to scroll before keyboard appears
        try {
            await setsInput.scrollIntoView();
            await browser.pause(500);
            console.log(`Scrolled to muscle group ${muscleGroupId}`);
            
            // For bottom muscle groups, scroll a bit more to ensure space above keyboard
            if (muscleGroupId >= 12) {
                // Scroll down a bit more to ensure element is well above keyboard area
                try {
                    await browser.execute('mobile: scroll', { 
                        direction: 'down',
                        element: setsInput.elementId 
                    });
                    await browser.pause(300);
                } catch (e2) {
                    // Alternative scroll failed, continue
                }
            }
        } catch (e) {
            console.log(`Scroll failed for muscle group ${muscleGroupId}, trying alternative scroll...`);
            // Try scrolling down if initial scroll fails
            try {
                await browser.execute('mobile: scroll', { 
                    direction: 'down',
                    element: setsInput.elementId 
                });
                await browser.pause(500);
            } catch (e2) {
                console.log(`Alternative scroll also failed for muscle group ${muscleGroupId}, continuing...`);
            }
        }
        
        await expect(setsInput).toBeDisplayed({ wait: 5000 });
        await expect(setsInput).toBeEnabled({ wait: 2000 });
        console.log(`Element is displayed and enabled for muscle group ${muscleGroupId}`);
        
        // Click the input field
        await setsInput.click();
        await browser.pause(400);
        console.log(`Clicked input for muscle group ${muscleGroupId}`);
        
        // If keyboard appeared and element is no longer visible, dismiss keyboard and scroll again
        try {
            const isKeyboardShown = await browser.isKeyboardShown();
            if (isKeyboardShown) {
                const isStillVisible = await setsInput.isDisplayed();
                if (!isStillVisible) {
                    console.log('Keyboard appeared and element is not visible, dismissing keyboard...');
                    await this.hideKeyboard();
                    // Scroll again after dismissing keyboard
                    await setsInput.scrollIntoView();
                    await browser.pause(300);
                }
            }
        } catch (e) {
            console.log('Could not check keyboard visibility after click');
        }
        
        await setsInput.setValue(numberOfSets.toString());
        console.log(`Set value ${numberOfSets} for muscle group ${muscleGroupId}`);
        
        await browser.pause(300);
        return this;
    }

    /**
     * Hide keyboard if it's shown
     */
    private async hideKeyboard() {
        try {
            // Check if keyboard is shown
            const isKeyboardShown = await browser.isKeyboardShown();
            if (isKeyboardShown) {
                console.log('Keyboard is shown, attempting to dismiss...');
                // Tap on a non-interactive element to dismiss keyboard
                // Try tapping on the notes label or screen title
                try {
                    const notesLabel = ManageWorkoutDayObjects.notesLabel;
                    if (await notesLabel.isDisplayed()) {
                        await notesLabel.click();
                        await browser.pause(200);
                    }
                } catch (e) {
                    // Try alternative: tap on screen title
                    try {
                        const screenTitle = ManageWorkoutDayObjects.manageWorkoutDayScreen;
                        if (await screenTitle.isDisplayed()) {
                            await screenTitle.click();
                            await browser.pause(200);
                        }
                    } catch (e2) {
                        console.log('Could not find element to dismiss keyboard');
                    }
                }
                
                // Wait for keyboard to hide
                await browser.waitUntil(async () => {
                    return !(await browser.isKeyboardShown());
                }, {
                    timeout: 2000,
                    timeoutMsg: 'Keyboard did not hide within timeout'
                });
                console.log('Keyboard dismissed');
            }
        } catch (error) {
            console.log('Keyboard dismissal check completed:', error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * Save the workout day
     */
    public async saveWorkoutDay() {
        // Dismiss keyboard by clicking on Notes label
        try {
            const notesLabel = ManageWorkoutDayObjects.notesLabel;
            const isNotesVisible = await notesLabel.isDisplayed();
            
            if (!isNotesVisible) {
                await browser.swipe({direction: 'down', percent: 0.5});
            }
            
            if (await notesLabel.isDisplayed()) {
                await notesLabel.doubleClick();
                await browser.pause(400);
            }
        } catch (e) {
            // Keyboard might not be open or Notes label not accessible
        }
        
        let saveButton = ManageWorkoutDayObjects.saveWorkoutDayButton;
        await saveButton.scrollIntoView();
        await browser.pause(1500);
        
        // Re-query the button to ensure we have the latest reference
        saveButton = ManageWorkoutDayObjects.saveWorkoutDayButton;
        await expect(saveButton).toBeDisplayed({ wait: 5000 });
        
        await saveButton.click();
        await browser.pause(500); // Give time for the click to register
        
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
}

export default new ManageWorkoutDayPage();

/**
 * Creates a fluent proxy instance of ManageWorkoutDayPage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentManageWorkoutDayPage();
 * await fluentPage
 *     .waitForScreen()
 *     .enterDayNumber(1)
 *     .enterDayName('Monday')
 *     .addSet('4 sets of chest')
 *     .saveWorkoutDay()
 *     .execute();
 * ```
 */
export const createFluentManageWorkoutDayPage = () => createFluentProxy(new ManageWorkoutDayPage());

