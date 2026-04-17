import { screen } from '@chauhaidang/xq-test-utils';

const { by } = screen;

class CreateRoutinePage {
    async waitForScreen() {
        await screen.waitFor(by.id('create-routine-screen')).toBeVisible({ timeout: 10_000 });
        return this;
    }

    async enterRoutineName(name: string) {
        await screen.element(by.id('routine-name-input')).replaceText(name);
        return this;
    }

    async enterRoutineDescription(description: string) {
        await screen.element(by.id('routine-description-input')).replaceText(description);
        return this;
    }

    async verifyToggleIsActive() {
        await screen.expect(by.id('routine-active-switch')).toHaveValue('1');
        return this;
    }

    async tapCreate() {
        // Dismiss keyboard by tapping a label outside of input
        try {
            await screen.element(by.label('Active')).tap();
        } catch {
            // keyboard may already be dismissed
        }
        await screen.waitFor(by.id('submit-button')).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id('submit-button')).tap();
        return this;
    }

    async closePopup() {
        // Wait for the success alert and tap OK to navigate back
        await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 8_000 });
        await screen.element(by.text('OK')).tap();
        return this;
    }

    async tapBack() {
        await screen.element(by.label('My Routines, back')).tap();
        return this;
    }
}

export default new CreateRoutinePage();
