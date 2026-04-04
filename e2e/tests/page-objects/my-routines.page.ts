import { $, expect, browser } from '@wdio/globals';
import MyRoutinesObjects from './objects/my-routines.objects.js';
import RoutineListObjects from './objects/routine-list.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';

/**
 * Page object for the "My Routines" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class MyRoutinesPage extends Page {

    /**
     * Wait for the My Routines screen to be displayed
     */
    public async waitForScreen() {
        await browser.pause(2000);
        
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                console.log(`⚠️  Dismissing alert: ${alert}`);
                await browser.dismissAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present, continue
        }
        
        try {
            await expect(MyRoutinesObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        } catch (error) {
            try {
                await expect(MyRoutinesObjects.routineListScreen).toBeDisplayed({ wait: 5000 });
            } catch {
                await expect(MyRoutinesObjects.routineListContainer).toBeDisplayed({ wait: 5000 });
            }
        }
        return this;
    }

    /**
     * Tap on the Create Routine button
     */
    public async tapCreateRoutine() {
        await MyRoutinesObjects.createRoutineButton.click();
        return this;
    }

    /**
     * Get the list of routines
     */
    public async getRoutineList() {
        return await MyRoutinesObjects.routineList;
    }

    /**
     * Verify that a routine with the given name exists in the list
     * @param routineName The name of the routine to verify
     */
    public async verifyRoutineExists(routineName: string) {
        let routineElement = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
        
        try {
            await routineElement.waitForDisplayed({ timeout: 5000 });
            return this;
        } catch (error) {
            // Try alternative strategies
        }
        
        routineElement = $(`//XCUIElementTypeOther[starts-with(@label, "${routineName}")]`);
        try {
            await routineElement.waitForDisplayed({ timeout: 3000 });
            return this;
        } catch (error) {
            // Try next strategy
        }
        
        routineElement = $(`//XCUIElementTypeOther[contains(@name, "routine-item") and contains(@label, "${routineName}")]`);
        try {
            await routineElement.waitForDisplayed({ timeout: 3000 });
            return this;
        } catch (error) {
            // Last resort
        }
        
        routineElement = $(`//XCUIElementTypeStaticText[@name="${routineName}"]`);
        await routineElement.waitForDisplayed({ timeout: 10000 });
        return this;
    }

    /**
     * Tap on a routine item to view/edit it
     * @param indexOrName The index of the routine (1-based) or the routine name
     */
    public async tapRoutineItem(indexOrName: number | string) {
        if (typeof indexOrName === 'number') {
            const routineItem = MyRoutinesObjects.getRoutineItemTouchable(indexOrName);
            await expect(routineItem).toBeDisplayed();
            await routineItem.click();
        } else {
            const routineItem = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${indexOrName}")]`);
            await expect(routineItem).toBeDisplayed();
            await routineItem.click();
        }
        return this;
    }

    /**
     * Tap edit button for a routine
     * @param index The index of the routine (1-based)
     */
    public async tapEditRoutine(index: number) {
        const editButton = await MyRoutinesObjects.getEditRoutineButton(index);
        await expect(editButton).toBeDisplayed();
        await editButton.click();
        return this;
    }

    /**
     * Tap delete button for a routine
     * @param routineName The name of the routine
     */
    public async tapDeleteRoutine(routineName: string) {
        const deleteButton = await MyRoutinesObjects.getDeleteRoutineButton(routineName);
        await expect(deleteButton).toBeDisplayed();
        await deleteButton.click();
        await browser.acceptAlert();
        return this;
    }

    /**
     * Tap the report button for a routine by routine ID
     * @param routineId The routine ID
     */
    public async tapReportButton(routineId: number) {
        const reportButton = RoutineListObjects.getReportButton(routineId);
        
        // Wait for element to exist first
        await reportButton.waitForExist({ timeout: 5000 });
        
        // Explicitly scroll to element before clicking to avoid scroll direction issues
        try {
            await reportButton.scrollIntoView();
            await browser.pause(500);
        } catch (scrollError) {
            console.log(`Initial scroll failed for report button ${routineId}, trying alternative scroll...`);
            // Try scrolling down if initial scroll fails (element might be below viewport)
            try {
                await browser.execute('mobile: scroll', { 
                    direction: 'down',
                    element: reportButton.elementId 
                });
                await browser.pause(500);
            } catch (e2) {
                console.log(`Alternative scroll also failed, continuing...`);
            }
        }
        
        await expect(reportButton).toBeDisplayed({ wait: 5000 });
        await reportButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Tap the report button for a routine by name
     * @param routineName The name of the routine
     */
    public async tapReportButtonByName(routineName: string) {
        // Find the routine item first to get its ID
        const routineItem = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
        await expect(routineItem).toBeDisplayed({ wait: 5000 });
        
        // Try to extract ID from the name attribute
        const nameAttr = await routineItem.getAttribute('name');
        const match = nameAttr?.match(/routine-item-touchable-(\d+)/);
        if (match) {
            const routineId = parseInt(match[1], 10);
            await this.tapReportButton(routineId);
        } else {
            // Fallback: try to find report button near the routine item
            const reportButton = RoutineListObjects.getReportButtonByName(routineName);
            
            // Wait for element to exist first
            await reportButton.waitForExist({ timeout: 5000 });
            
            // Explicitly scroll to element before clicking
            try {
                await reportButton.scrollIntoView();
                await browser.pause(500);
            } catch (scrollError) {
                console.log(`Initial scroll failed for report button by name "${routineName}", trying alternative scroll...`);
                // Try scrolling down if initial scroll fails
                try {
                    await browser.execute('mobile: scroll', { 
                        direction: 'down',
                        element: reportButton.elementId 
                    });
                    await browser.pause(500);
                } catch (e2) {
                    console.log(`Alternative scroll also failed, continuing...`);
                }
            }
            
            await expect(reportButton).toBeDisplayed({ wait: 5000 });
            await reportButton.click();
            await browser.pause(1000);
        }
        return this;
    }

    /**
     * Delete a routine by its name
     * @param routineName The name of the routine to delete
     */
    public async deleteRoutineByName(routineName: string) {
        try {
            let screenReady = false;
            for (let i = 0; i < 3; i++) {
                try {
                    await this.waitForScreen();
                    screenReady = true;
                    break;
                } catch (e) {
                    await browser.pause(1000);
                }
            }
            
            if (!screenReady) {
                console.log('Screen wait failed, attempting to find routine anyway...');
            }
            
            await browser.pause(500);
            
            const routines = await this.getRoutineList();
            let routineIndex = -1;
            const routinesLength = await routines.length;

            for (let i = 0; i < routinesLength; i++) {
                try {
                    const routine = routines[i];
                    const label = await routine.getAttribute('label');
                    if (label && label.includes(routineName)) {
                        routineIndex = i + 1;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (routineIndex === -1) {
                const routineItem = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
                try {
                    await expect(routineItem).toBeDisplayed({ wait: 2000 });
                    const nameAttr = await routineItem.getAttribute('name');
                    const match = nameAttr?.match(/routine-item-touchable-(\d+)/);
                    if (match) {
                        routineIndex = parseInt(match[1], 10);
                    }
                } catch (e) {
                    console.log(`Routine "${routineName}" not found - may already be deleted`);
                    return this;
                }
            }
            
            if (routineIndex === -1) {
                console.log(`Could not determine index for routine "${routineName}"`);
                return this;
            }
            
            await this.tapDeleteRoutine(routineIndex.toString());
            
            await browser.pause(500);
            try {
                const confirmSelectors = [
                    $('~Delete'),
                    $('~Confirm'),
                    $('~OK'),
                    $('//XCUIElementTypeButton[@name="Delete"]'),
                    $('//XCUIElementTypeButton[@name="Confirm"]'),
                    $('//XCUIElementTypeButton[contains(@label, "Delete")]')
                ];
                
                for (const confirmButton of confirmSelectors) {
                    try {
                        if (await confirmButton.isDisplayed()) {
                            await confirmButton.click();
                            await browser.pause(500);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            } catch (e) {
                // No confirmation dialog
            }
            
            await browser.pause(500);
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`Error deleting routine "${routineName}": ${errorMessage}`);
        }
        return this;
    }
}

export default new MyRoutinesPage();

/**
 * Creates a fluent proxy instance of MyRoutinesPage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentMyRoutinesPage();
 * await fluentPage
 *     .waitForScreen()
 *     .tapCreateRoutine()
 *     .verifyRoutineExists('My Routine')
 *     .execute();
 * ```
 */
export const createFluentMyRoutinesPage = () => createFluentProxy(new MyRoutinesPage());
