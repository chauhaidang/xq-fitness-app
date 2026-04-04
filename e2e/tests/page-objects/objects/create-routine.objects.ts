import { $ } from '@wdio/globals';

/**
 * Object definitions for the "Create Routine" form screen
 * Contains only selectors/objects - no actions
 */
class CreateRoutineObjects {
    public get routineNameInput() {
        return $('~routine-name-input');
    }

    public get routineDescriptionInput() {
        return $('~routine-description-input');
    }

    public get activeToggle() {
        return $('~routine-active-switch');
    }

    public get createButton() {
        return $('~submit-button');
    }

    public get successPopup() {
        return $('~Success');
    }

    public get closeButton() {
        return $('~OK');
    }

    public get labelActive() {
        return $('~Active');
    }

    public get labelDescription() {
        return $('~Description');
    }

    public get labelRoutineName() {
        return $('~Routine Name *');
    }

    public get labelSubmitButton() {
        return $('~Create Routine');
    }

    public get createRoutineScreen() {
        return $('~create-routine-screen');
    }

    public get backButton() {
        return $('~My Routines, back');
    }
}

export default new CreateRoutineObjects();
