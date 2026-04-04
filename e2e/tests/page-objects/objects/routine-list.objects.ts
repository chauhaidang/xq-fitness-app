import { $ } from '@wdio/globals';

/**
 * Object definitions for the "Routine List" screen
 * Contains only selectors/objects - no actions
 * Extends MyRoutinesObjects with report button selectors
 */
class RoutineListObjects {
    /**
     * Get report button for a routine by routine ID
     * @param routineId The routine ID
     */
    public getReportButton(routineId: number) {
        return $(`~report-routine-${routineId}`);
    }

    /**
     * Get report button for a routine by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getReportButtonByIndex(index: number) {
        return $(`~report-routine-${index}`);
    }

    /**
     * Get report button near a routine item by routine name (fallback selector)
     * @param routineName The name of the routine
     */
    public getReportButtonByName(routineName: string) {
        return $(`//XCUIElementTypeOther[contains(@name, "routine-item") and contains(@label, "${routineName}")]//XCUIElementTypeOther[contains(@name, "report-routine")]`);
    }
}

export default new RoutineListObjects();

