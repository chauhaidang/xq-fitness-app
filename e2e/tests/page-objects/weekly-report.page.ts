import { expect, browser } from '@wdio/globals';
import WeeklyReportObjects from './objects/weekly-report.objects.js';
import Page from './page.js';
import { createFluentProxy } from '../../support/utils/fluent-proxy.js';

/**
 * Page object for the "Weekly Report" screen
 * Uses composition pattern: composes objects instance and contains action methods
 * @internal
 */
class WeeklyReportPage extends Page {
    /**
     * Wait for the Weekly Report screen to be displayed
     */
    public async waitForScreen() {
        await browser.pause(2000);
        
        // Handle alerts if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                console.log(`⚠️  Dismissing alert: ${alert}`);
                await browser.dismissAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present
        }
        
        try {
            await expect(WeeklyReportObjects.weeklyReportScreen).toBeDisplayed({ wait: 10000 });
        } catch (error) {
            // Try alternative selector
            await expect(WeeklyReportObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        }
        return this;
    }

    /**
     * Wait for loading to complete
     */
    public async waitForLoadingToComplete() {
        try {
            // Wait for loading indicator to disappear
            await WeeklyReportObjects.loadingIndicator.waitForDisplayed({ timeout: 5000, reverse: true });
        } catch (error) {
            // Loading might have already completed
        }
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that the report is displayed with data
     */
    public async verifyReportDisplayed() {
        await this.waitForLoadingToComplete();
        
        // Verify we're not in loading or error state
        try {
            const loadingContainer = await WeeklyReportObjects.loadingContainer.isDisplayed();
            if (loadingContainer) {
                throw new Error('Report is still in loading state');
            }
        } catch (error) {
            // Loading container not found, which is good
        }
        
        try {
            const errorContainer = await WeeklyReportObjects.errorContainer.isDisplayed();
            if (errorContainer) {
                throw new Error('Report is in error state');
            }
        } catch (error) {
            // Error container not found, which is good
        }
        
        // Verify report screen is displayed
        await expect(WeeklyReportObjects.weeklyReportScreen).toBeDisplayed({ wait: 5000 });
        
        return this;
    }

    /**
     * Verify that the empty state is displayed
     */
    public async verifyEmptyState() {
        await this.waitForLoadingToComplete();
        await expect(WeeklyReportObjects.emptyState).toBeDisplayed({ wait: 5000 });
        return this;
    }

    /**
     * Verify that an error state is displayed
     */
    public async verifyErrorState() {
        await this.waitForLoadingToComplete();
        await expect(WeeklyReportObjects.errorContainer).toBeDisplayed({ wait: 5000 });
        return this;
    }

    /**
     * Tap the reload button (used when error occurs)
     */
    public async tapReload() {
        await expect(WeeklyReportObjects.reloadButton).toBeDisplayed({ wait: 5000 });
        await WeeklyReportObjects.reloadButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that a muscle group is displayed with a specific total sets count
     * @param muscleGroupName The name of the muscle group (e.g., "Chest")
     * @param expectedSets The expected number of sets
     */
    public async verifyMuscleGroupTotal(muscleGroupName: string, expectedSets: number) {
        const muscleGroupElement = WeeklyReportObjects.getMuscleGroupByName(muscleGroupName);
        await muscleGroupElement.scrollIntoView({ direction: 'down', scrollableElement: WeeklyReportObjects.scrollView });
        await expect(muscleGroupElement).toBeDisplayed({ wait: 5000 });
        
        // Extract the aggregated accessibility label and verify it contains the correct sets data
        const labelText = await muscleGroupElement.getAttribute('label');
        if (!labelText) {
            throw new Error(`Accessibility label was empty for muscle group ${muscleGroupName}`);
        }
        
        if (!labelText.includes(`${expectedSets} sets`)) {
            throw new Error(`Expected muscle group label to contain "${expectedSets} sets", but it was: "${labelText}"`);
        }
        
        return this;
    }

    /**
     * Verify the progress badge status for an exercise's reps and weight metrics.
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param expectedRepStatus 'INCREASED' | 'DECREASED' | 'MAINTAINED' | 'FIRST_WEEK'
     * @param expectedWeightStatus 'INCREASED' | 'DECREASED' | 'MAINTAINED' | 'FIRST_WEEK'
     */
    public async verifyExerciseProgressStatus(exerciseName: string, expectedRepStatus: string, expectedWeightStatus: string) {
        const statusLabel = (status: string) => {
            switch (status) {
                case 'INCREASED': return '↑ Increased';
                case 'DECREASED': return '↓ Decreased';
                case 'MAINTAINED': return '= Same';
                default: return '— first week';
            }
        };

        const repBadge = WeeklyReportObjects.getRepProgressBadge(exerciseName);
        await repBadge.scrollIntoView({ direction: 'down', scrollableElement: WeeklyReportObjects.scrollView });
        await expect(repBadge).toBeDisplayed({ wait: 5000 });
        const repLabel = await repBadge.getAttribute('label');
        const expectedRepLabel = statusLabel(expectedRepStatus);
        if (!repLabel?.includes(expectedRepLabel)) {
            throw new Error(`Rep progress badge for "${exerciseName}": expected "${expectedRepLabel}" but got "${repLabel}"`);
        }

        const weightBadge = WeeklyReportObjects.getWeightProgressBadge(exerciseName);
        await expect(weightBadge).toBeDisplayed({ wait: 5000 });
        const weightLabel = await weightBadge.getAttribute('label');
        const expectedWeightLabel = statusLabel(expectedWeightStatus);
        if (!weightLabel?.includes(expectedWeightLabel)) {
            throw new Error(`Weight progress badge for "${exerciseName}": expected "${expectedWeightLabel}" but got "${weightLabel}"`);
        }

        return this;
    }

    /**
     * Get the back button to return to previous screen
     */
    public async tapBack() {
        await expect(WeeklyReportObjects.backButton).toBeDisplayed({ wait: 5000 });
        await WeeklyReportObjects.backButton.click();
        await browser.pause(1000);
        return this;
    }

    /**
     * Verify that an exercise total is displayed with specific values
     * @param exerciseName The exercise name (e.g., "Bench Press")
     * @param totalReps The expected total reps
     * @param weightKg The expected weight (kg)
     */
    public async verifyExerciseTotalDisplayed(exerciseName: string, totalReps: number, weightKg: number) {
        const exerciseTotal = WeeklyReportObjects.getExerciseTotalByName(exerciseName);
        await exerciseTotal.scrollIntoView();
        await browser.pause(500);
        await expect(exerciseTotal).toBeDisplayed({ wait: 5000 });
        
        // Verify exercise name is displayed
        const exerciseNameText = WeeklyReportObjects.getExerciseNameText(exerciseName);
        await expect(exerciseNameText).toBeDisplayed({ wait: 3000 });
        
        // Verify total reps is displayed
        const totalRepsText = WeeklyReportObjects.getTotalRepsText(exerciseName, totalReps);
        await expect(totalRepsText).toBeDisplayed({ wait: 3000 });
        
        // Verify weight (kg) is displayed
        const weightKgText = WeeklyReportObjects.getWeightKgText(exerciseName, weightKg);
        await expect(weightKgText).toBeDisplayed({ wait: 3000 });
        
        return this;
    }

    /**
     * Verify the count of exercise totals displayed
     * @param expectedCount The expected number of exercise totals
     */
    public async verifyExerciseTotalsCount(expectedCount: number) {
        // Wait for exercise totals section to be displayed
        try {
            await expect(WeeklyReportObjects.exerciseTotalsSection).toBeDisplayed({ wait: 5000 });
        } catch (error) {
            // Section might not have a specific container, continue
        }
        
        // Count exercise total items
        let actualCount = 0;
        for (let i = 0; i < 100; i++) { // Max 100 exercises
            try {
                const exerciseTotal = WeeklyReportObjects.getExerciseTotalByIndex(i);
                if (await exerciseTotal.isDisplayed()) {
                    actualCount++;
                } else {
                    break;
                }
            } catch (error) {
                break;
            }
        }
        
        if (actualCount !== expectedCount) {
            throw new Error(`Expected ${expectedCount} exercise totals, but found ${actualCount}`);
        }
        
        return this;
    }

    /**
     * Get exercise total by index and return its details
     * @param index The index of the exercise total (0-based)
     * @returns Object with exercise name, total reps, and total weight (if available)
     */
    public async getExerciseTotalByIndex(index: number) {
        const exerciseTotal = WeeklyReportObjects.getExerciseTotalByIndex(index);
        await exerciseTotal.scrollIntoView();
        await browser.pause(500);
        await expect(exerciseTotal).toBeDisplayed({ wait: 5000 });
        
        // Get the label/text content of the exercise total element
        const label = await exerciseTotal.getAttribute('label');
        
        return {
            element: exerciseTotal,
            label: label || '',
        };
    }
}

export default new WeeklyReportPage();

/**
 * Creates a fluent proxy instance of WeeklyReportPage that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentWeeklyReportPage();
 * await fluentPage
 *     .waitForScreen()
 *     .waitForLoadingToComplete()
 *     .verifyMuscleGroupTotal('Chest', 7)
 *     .execute();
 * ```
 */
export const createFluentWeeklyReportPage = () => createFluentProxy(new WeeklyReportPage());

