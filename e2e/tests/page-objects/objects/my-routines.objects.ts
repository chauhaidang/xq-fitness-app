import { $, $$ } from '@wdio/globals';

/**
 * Object definitions for the "My Routines" screen
 * Contains only selectors/objects - no actions
 */
class MyRoutinesObjects {
    public get screenTitle() {
        return $('~My Routines');
    }

    public get createRoutineButton() {
        return $('~create-routine-button');
    }

    public get routineList() {
        return $$('~Routine Item');
    }

    public get routineListScreen() {
        return $('~routine-list-screen');
    }

    public get routineListContainer() {
        return $('~routine-list');
    }

    /**
     * Get routine item by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getRoutineItem(index: number) {
        return $(`~routine-item-${index}`);
    }

    /**
     * Get routine item touchable area by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getRoutineItemTouchable(index: number) {
        return $(`~routine-item-touchable-${index}`);
    }

    /**
     * Get edit button for routine by index (1-based)
     * @param index The index of the routine (1, 2, 3, etc.)
     */
    public getEditRoutineButton(index: number) {
        return $(`~edit-routine-${index}`);
    }

    /**
     * Get delete button for routine by name
     * @param routineName The name of the routine
     */
    public getDeleteRoutineButton(routineName: string) {
        return $(`//*[@label="Delete routine ${routineName}"]`);
    }
}

export default new MyRoutinesObjects();
