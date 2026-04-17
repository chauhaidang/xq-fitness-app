import { screen } from '@chauhaidang/xq-test-utils';

const { by } = screen;

class MyRoutinesPage {
    async waitForScreen() {
        await screen.waitFor(by.id('routine-list-screen')).toBeVisible({ timeout: 15_000 });
        // Dismiss any error alert (e.g. 'Failed to load routines' from failed fetch on startup)
        try {
            await screen.waitFor(by.text('OK')).toBeVisible({ timeout: 3_000 });
            await screen.element(by.text('OK')).tap();
        } catch { /* no alert showing */ }
        return this;
    }

    async pullToRefresh() {
        await screen.element(by.id('routine-list')).swipe('down', 'slow', 0.5);
        return this;
    }

    async tapCreateRoutine() {
        await screen.element(by.id('create-routine-button')).tap();
        return this;
    }

    async verifyRoutineExists(routineName: string) {
        await screen.waitFor(by.text(routineName)).toBeVisible({ timeout: 15_000 });
        return this;
    }

    async tapRoutineItem(routineName: string) {
        // Pull to refresh first so API-created data is visible
        await this.pullToRefresh();
        await screen.waitFor(by.text(routineName)).toBeVisible({ timeout: 10_000 });
        await screen.element(by.text(routineName)).tap();
        return this;
    }

    async tapDeleteRoutine(routineName: string) {
        await screen.element(by.label(`Delete routine ${routineName}`)).tap();
        await screen.waitFor(by.text('Delete')).toBeVisible({ timeout: 3_000 });
        await screen.element(by.text('Delete')).tap();
        return this;
    }

    async tapReportButton(routineId: number) {
        await screen.waitFor(by.id(`report-routine-${routineId}`)).toBeVisible({ timeout: 5_000 });
        await screen.element(by.id(`report-routine-${routineId}`)).tap();
        return this;
    }
}

export default new MyRoutinesPage();
