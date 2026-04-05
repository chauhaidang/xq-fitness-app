import { expect, browser } from '@wdio/globals';
import CreateRoutineObjects from './objects/create-routine.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';

/**
 * Page object for the "Create Routine" form screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class CreateRoutinePage extends Page {

    /**
     * Enter routine name
     * @param name The routine name to enter
     */
    public async enterRoutineName(name: string) {
        await CreateRoutineObjects.routineNameInput.setValue(name);
        return this;
    }

    /**
     * Enter routine description
     * @param description The routine description to enter
     */
    public async enterRoutineDescription(description: string) {
        await CreateRoutineObjects.routineDescriptionInput.setValue(description);
        return this;
    }

    /**
     * Set the active toggle state
     * @param enabled Whether the toggle should be enabled (true) or disabled (false)
     */
    public async setActiveToggle(enabled: boolean) {
        const toggle = await CreateRoutineObjects.activeToggle;
        const currentValue = await toggle.getAttribute('value');
        const isCurrentlyEnabled = currentValue === '1' || currentValue === 'true';
        
        if (enabled !== isCurrentlyEnabled) {
            await toggle.click();
        }
        return this;
    }

    /**
     * Verify that the toggle is ACTIVE (enabled)
     */
    public async verifyToggleIsActive() {
        const toggle = await CreateRoutineObjects.activeToggle;
        const value = await toggle.getAttribute('value');
        const isActive = value === '1' || value === 'true';
        if (!isActive) {
            throw new Error(`Toggle is not active. Current value: ${value}`);
        }
        return this;
    }

    /**
     * Hide keyboard using the best method for iOS
     */
    private async hideKeyboard() {
        try {
            await CreateRoutineObjects.labelActive.click();
            await browser.pause(200);
        } catch (error) {
            console.error('Keyboard dismissal failed', error);
        }
        
        try {
            await browser.waitUntil(async () => {
                return !(await browser.isKeyboardShown());
            }, {
                timeout: 2000,
                timeoutMsg: 'Keyboard did not hide within timeout'
            });
        } catch (error) {
            console.log('Keyboard visibility check completed');
        }
    }

    /**
     * Tap the Create Routine button
     */
    public async tapCreate() {
        await this.hideKeyboard();
        await expect(CreateRoutineObjects.createButton).toBeDisplayed();
        
        const isEnabled = await CreateRoutineObjects.createButton.isEnabled();
        if (!isEnabled) {
            throw new Error('Create Routine button is disabled. Form may be invalid.');
        }
        
        await CreateRoutineObjects.createButton.click();
        console.log('Create button clicked successfully');
        return this;
    }

    /**
     * Wait for and close the success popup
     */
    public async closePopup() {
        try {
            await expect(CreateRoutineObjects.successPopup).toBeDisplayed();
            await CreateRoutineObjects.closeButton.click();
        } catch (error) {
            console.log('Success popup not found, assuming automatic navigation');
        }
        return this;
    }

    /**
     * Tap the back button to return to My Routines
     */
    public async tapBack() {
        await expect(CreateRoutineObjects.backButton).toBeDisplayed();
        await CreateRoutineObjects.backButton.click();
        return this;
    }

    /**
     * Wait for the Create Routine screen to be displayed
     */
    public async waitForScreen() {
        await expect(CreateRoutineObjects.createRoutineScreen).toBeDisplayed();
        return this;
    }
}

export default new CreateRoutinePage();

/**
 * Creates a fluent proxy instance of CreateRoutinePage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentCreateRoutinePage();
 * await fluentPage
 *     .waitForScreen()
 *     .enterRoutineName('My Routine')
 *     .enterRoutineDescription('Description')
 *     .tapCreate()
 *     .execute();
 * ```
 */
export const createFluentCreateRoutinePage = () => createFluentProxy(new CreateRoutinePage());
