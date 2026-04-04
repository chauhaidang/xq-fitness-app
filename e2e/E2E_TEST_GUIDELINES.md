# E2E Test Guidelines

This document provides comprehensive guidelines for writing new end-to-end (E2E) tests for the XQ Fitness mobile application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Test Layers](#test-layers)
4. [Writing New Tests](#writing-new-tests)
5. [Best Practices](#best-practices)
6. [Common Patterns](#common-patterns)
7. [Debugging and Troubleshooting](#debugging-and-troubleshooting)

## Architecture Overview

The E2E test suite follows a **layered architecture** with clear separation of concerns:

```
Test Specs (Mocha)
    ↓
Tasks (Business Operations)
    ↓
Page Objects (Screen Actions)
    ↓
Objects (Element Selectors)
```

### Key Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Reusability**: Lower layers can be reused across multiple tests
3. **Maintainability**: Changes to UI elements only require updates in Objects layer
4. **Readability**: Test specs read like business requirements

## Directory Structure

```
e2e/
├── config/
│   └── wdio.conf.ts          # WebdriverIO configuration
├── tests/
│   ├── *.spec.ts             # Test specification files (Mocha)
│   ├── page-objects/
│   │   ├── page.ts           # Base page class
│   │   ├── objects/
│   │   │   └── *.objects.ts  # Element selectors only
│   │   └── *.page.ts         # Page object classes
│   └── tasks/
│       ├── task.ts           # Base task class
│       └── *.tasks.ts        # Business task classes
├── support/
│   ├── hooks/
│   │   └── test-hooks.ts     # Test lifecycle hooks
│   ├── utils/
│   │   └── *.enum.ts         # Enums and utilities
│   ├── constants/            # Test constants
│   └── fixtures/             # Test data fixtures
├── artifacts/                 # Test artifacts (screenshots, logs, DOM captures)
└── generated-clients/        # Auto-generated API clients
```

## Test Layers

### 1. Objects Layer (`tests/page-objects/objects/*.objects.ts`)

**Purpose**: Define element selectors only. No actions, no logic.

**Rules**:
- Only contains element selectors using WebdriverIO's `$` and `$$`
- Use accessibility labels (`~label`) when available
- Use XPath as fallback when accessibility labels are not available
- Export a singleton instance of the class
- Use getters for simple selectors
- Use methods for dynamic selectors (e.g., with parameters)

**Example**:

```typescript
import { $, $$ } from '@wdio/globals';

class MyRoutinesObjects {
    public get screenTitle() {
        return $('~My Routines');
    }

    public get createRoutineButton() {
        return $('~create-routine-button');
    }

    public getRoutineItemTouchable(index: number) {
        return $(`~routine-item-touchable-${index}`);
    }
}

export default new MyRoutinesObjects();
```

**Best Practices**:
- Prefer accessibility labels (`~label`) over XPath
- Use descriptive names that match the UI element's purpose
- Group related selectors in the same objects file
- Document complex selectors with comments

### 2. Page Objects Layer (`tests/page-objects/*.page.ts`)

**Purpose**: Define screen-level actions and interactions. Composes Objects.

**Rules**:
- Extends `Page` base class
- Contains action methods (tap, enter, verify, etc.)
- Uses Objects layer for element access
- Methods should return `this` for method chaining
- Handle UI variations (alerts, popups, keyboard) internally
- Export a singleton instance

**Example**:

```typescript
import { expect, browser } from '@wdio/globals';
import MyRoutinesObjects from './objects/my-routines.objects.js';
import Page from './page.js';

class MyRoutinesPage extends Page {
    public async waitForScreen() {
        await browser.pause(2000);
        
        // Handle alerts if present
        try {
            const alert = await browser.getAlertText();
            if (alert) {
                await browser.dismissAlert();
                await browser.pause(1000);
            }
        } catch (error) {
            // No alert present
        }
        
        await expect(MyRoutinesObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        return this;
    }

    public async tapCreateRoutine() {
        await MyRoutinesObjects.createRoutineButton.click();
        return this;
    }

    public async verifyRoutineExists(routineName: string) {
        const routineElement = $(`//XCUIElementTypeOther[contains(@name, "routine-item-touchable") and contains(@label, "${routineName}")]`);
        await routineElement.waitForDisplayed({ timeout: 5000 });
        return this;
    }
}

export default new MyRoutinesPage();
```

**Best Practices**:
- Always include `waitForScreen()` method for each page
- Handle UI variations (alerts, popups, keyboard) internally
- Use `browser.pause()` sparingly; prefer explicit waits
- Return `this` for method chaining
- Use descriptive method names that reflect user actions
- Handle errors gracefully with try-catch when appropriate

### 3. Tasks Layer (`tests/tasks/*.tasks.ts`)

**Purpose**: Define business-level operations that compose multiple page object actions.

**Rules**:
- Composes Page Objects to perform complete business operations
- Handles navigation between screens
- Handles UI variations that span multiple screens
- Export a singleton instance
- Methods should be stable and reusable

**Example**:

```typescript
import { browser } from '@wdio/globals';
import MyRoutinesPage from '../page-objects/my-routines.page.js';
import CreateRoutinePage from '../page-objects/create-routine.page.js';

class RoutineTasks {
    async createRoutine(name: string, description: string, isActive = true) {
        // Navigate to create routine
        await MyRoutinesPage
            .waitForScreen()
            .tapCreateRoutine();
        
        // Fill in routine details
        await CreateRoutinePage
            .enterRoutineName(name)
            .enterRoutineDescription(description);
        
        // Verify toggle state if needed
        if (isActive) {
            await CreateRoutinePage.verifyToggleIsActive();
        }
        
        // Create routine and handle popup
        await CreateRoutinePage
            .tapCreate()
            .closePopup();
        
        // Wait for navigation back
        await MyRoutinesPage.waitForScreen();
    }

    async verifyRoutineExists(routineName: string) {
        await MyRoutinesPage
            .waitForScreen()
            .verifyRoutineExists(routineName);
    }
}

export default new RoutineTasks();
```

**Best Practices**:
- Compose page objects to create complete business workflows
- Handle navigation between screens
- Handle UI variations that span multiple screens (popups, alerts, keyboard)
- Use descriptive method names that reflect business operations
- Keep tasks focused on single business operations
- Document parameters and return values

### 4. Test Specs Layer (`tests/*.spec.ts`)

**Purpose**: Define test scenarios using Mocha framework. Uses Tasks and API clients.

**Rules**:
- Use Mocha's `describe`, `context`, and `it` blocks
- Use Tasks for UI interactions
- Use API clients for setup/teardown and verification
- Track created resources for cleanup
- Use `before`, `beforeEach`, `after`, `afterEach` hooks appropriately

**Example**:

```typescript
import RoutineTasks from './tasks/routine.tasks.js';
import WorkoutDayTasks from './tasks/workout-day.tasks.js';
import * as kit from '@chauhaidang/xq-common-kit';
import {Configuration, RoutinesApi} from 'xq-fitness-write-client';

describe('Manage Routine', () => {
    let routinesApi: RoutinesApi;
    let trackRoutines: number[] = [];
    const bundleId = 'com.xqfitness.app';

    before(() => {
        const configuration = new Configuration({
            basePath: 'http://localhost:8080/xq-fitness-write-service/api/v1',
        });
        routinesApi = new RoutinesApi(configuration);
    });

    beforeEach(async () => {
        trackRoutines = [];
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    after(async () => {
        for (const routineId of trackRoutines) {
            await routinesApi.deleteRoutine(routineId);
        }
    });

    context('When there is no routine', () => {
        const routineName = 'UL4' + kit.generateRandomString(5);
        const routineDescription = 'Upper Lower 4 days split';

        it('should let me create new routine with detail splits', async () => {
            await browser.activateApp(bundleId);
            await RoutineTasks.createRoutine(routineName, routineDescription);
            await RoutineTasks.verifyRoutineExists(routineName);
            await WorkoutDayTasks.addWorkoutDay(
                routineName,
                'Monday upper body',
                '4 sets of chest',
                '2 sets of back',
            );
            await RoutineTasks.deleteRoutine(routineName);
        });
    });

    context('When there is a routine', () => {
        it('should let me update the routine workout days set', async () => {
            const routine = await routinesApi.createRoutine({
                name: 'UL4' + kit.generateRandomString(5),
                description: 'test update routine workout days set',
                isActive: true,
            });

            trackRoutines.push(routine.data.id);

            await browser.activateApp(bundleId);
            await WorkoutDayTasks.editWorkoutDaySet(
                routine.data.name,
                'Wednesday Upper A',
                MuscleGroupId.Chest,
                6
            );
        });
    });
});
```

**Best Practices**:
- Use descriptive test names that explain what is being tested
- Use `context` blocks to group related tests
- Use API clients for test data setup when possible (faster than UI)
- Track all created resources in `trackRoutines` array for cleanup
- Clean up resources in `after` hook
- Reset app state in `beforeEach` hook
- Use random strings for test data to avoid conflicts
- Keep tests independent and isolated

## Writing New Tests

### Step-by-Step Guide

#### 1. Identify the Test Scenario

Determine what user flow you want to test. For example:
- "User can create a new routine"
- "User can edit workout day sets"
- "User can delete a routine"

#### 2. Create/Update Objects

If new UI elements are involved, create or update the objects file:

```typescript
// tests/page-objects/objects/new-screen.objects.ts
import { $ } from '@wdio/globals';

class NewScreenObjects {
    public get screenTitle() {
        return $('~New Screen');
    }

    public get actionButton() {
        return $('~action-button');
    }
}

export default new NewScreenObjects();
```

#### 3. Create/Update Page Object

Create or update the page object with actions:

```typescript
// tests/page-objects/new-screen.page.ts
import { expect } from '@wdio/globals';
import NewScreenObjects from './objects/new-screen.objects.js';
import Page from './page.js';

class NewScreenPage extends Page {
    public async waitForScreen() {
        await expect(NewScreenObjects.screenTitle).toBeDisplayed({ wait: 10000 });
        return this;
    }

    public async tapActionButton() {
        await NewScreenObjects.actionButton.click();
        return this;
    }
}

export default new NewScreenPage();
```

#### 4. Create/Update Tasks

Create or update tasks for business operations:

```typescript
// tests/tasks/new-feature.tasks.ts
import NewScreenPage from '../page-objects/new-screen.page.js';

class NewFeatureTasks {
    async performAction() {
        await NewScreenPage
            .waitForScreen()
            .tapActionButton();
    }
}

export default new NewFeatureTasks();
```

#### 5. Write Test Spec

Create or update the test spec:

```typescript
// tests/new-feature.spec.ts
import NewFeatureTasks from './tasks/new-feature.tasks.js';

describe('New Feature', () => {
    const bundleId = 'com.xqfitness.app';

    beforeEach(async () => {
        await browser.reloadSession();
        await browser.terminateApp(bundleId);
    });

    it('should perform the new action', async () => {
        await browser.activateApp(bundleId);
        await NewFeatureTasks.performAction();
        // Add assertions
    });
});
```

## Best Practices

### Element Selection

1. **Prefer Accessibility Labels**: Use `~label` syntax when available
   ```typescript
   $('~my-button')  // ✅ Good
   $('//XCUIElementTypeButton[@name="my-button"]')  // ⚠️ Use as fallback
   ```

2. **Use Descriptive Names**: Selector names should match UI element purpose
   ```typescript
   $('~create-routine-button')  // ✅ Good
   $('~button1')  // ❌ Bad
   ```

3. **Handle Dynamic Elements**: Use methods for dynamic selectors
   ```typescript
   getRoutineItem(index: number) {
       return $(`~routine-item-${index}`);
   }
   ```

### Waiting Strategies

1. **Explicit Waits**: Use `waitForDisplayed`, `waitForExist`, etc.
   ```typescript
   await expect(element).toBeDisplayed({ wait: 10000 });
   ```

2. **Avoid Hard Waits**: Use `browser.pause()` sparingly
   ```typescript
   await browser.pause(2000);  // ⚠️ Use only when necessary
   ```

3. **Wait for Screen**: Always wait for screen to be ready
   ```typescript
   await MyRoutinesPage.waitForScreen();
   ```

### Error Handling

1. **Handle UI Variations**: Alerts, popups, keyboard
   ```typescript
   try {
       const alert = await browser.getAlertText();
       if (alert) {
           await browser.dismissAlert();
       }
   } catch (error) {
       // No alert present
   }
   ```

2. **Graceful Degradation**: Try multiple strategies for finding elements
   ```typescript
   try {
       await expect(element1).toBeDisplayed({ timeout: 5000 });
   } catch (error) {
       await expect(element2).toBeDisplayed({ timeout: 5000 });
   }
   ```

### Test Data Management

1. **Use Random Data**: Avoid conflicts with parallel test runs
   ```typescript
   const routineName = 'UL4' + kit.generateRandomString(5);
   ```

2. **Track Resources**: Clean up created resources
   ```typescript
   let trackRoutines: number[] = [];
   trackRoutines.push(routineId);
   // Clean up in after hook
   ```

3. **Use API for Setup**: Faster than UI setup
   ```typescript
   const routine = await routinesApi.createRoutine({...});
   ```

### Code Organization

1. **Single Responsibility**: Each class/method should do one thing
2. **Method Chaining**: Return `this` for fluent API
3. **Singleton Pattern**: Export singleton instances
4. **Consistent Naming**: Use consistent naming conventions
5. **Documentation**: Add JSDoc comments for public methods

## Common Patterns

### Pattern 1: Screen Navigation

```typescript
// In Task
async navigateToScreen() {
    await HomePage
        .waitForScreen()
        .tapMenuItem('Settings');
    await SettingsPage.waitForScreen();
}
```

### Pattern 2: Form Filling

```typescript
// In Page Object
public async fillForm(name: string, description: string) {
    await this.enterName(name);
    await this.enterDescription(description);
    return this;
}
```

### Pattern 3: Verification

```typescript
// In Page Object
public async verifyData(expectedValue: string) {
    const actualValue = await this.dataElement.getText();
    expect(actualValue).toBe(expectedValue);
    return this;
}
```

### Pattern 4: Handling Alerts

```typescript
// In Page Object
public async waitForScreen() {
    try {
        const alert = await browser.getAlertText();
        if (alert) {
            await browser.dismissAlert();
            await browser.pause(1000);
        }
    } catch (error) {
        // No alert present
    }
    await expect(this.screenTitle).toBeDisplayed({ wait: 10000 });
    return this;
}
```

### Pattern 4: Dynamic Element Selection

```typescript
// In Objects
public getElementByIndex(index: number) {
    return $(`~element-${index}`);
}

public getElementByText(text: string) {
    return $(`//XCUIElementTypeStaticText[@label="${text}"]`);
}
```

## Debugging and Troubleshooting

### Test Hooks

The test suite includes automatic debugging hooks that capture:
- **DOM Tree**: Saved to `artifacts/dom-captures/page-source.xml` on test failure
- **Screenshots**: Saved to `artifacts/screenshots/screenshot.png` on test failure
- **Logs**: Console output with detailed error information

### Manual DOM Capture

You can manually capture DOM trees in page objects:

```typescript
import Page from './page.js';

class MyPage extends Page {
    public async debugScreen() {
        await this.captureDOMTree('my-screen');
        await this.printPageSource();
    }
}
```

### Common Issues

1. **Element Not Found**
   - Check accessibility labels in the app
   - Use DOM capture to see actual element structure
   - Try alternative selectors (XPath, different attributes)

2. **Timing Issues**
   - Increase wait timeouts
   - Add explicit waits before actions
   - Check for loading indicators

3. **Alert/Popup Issues**
   - Handle alerts in `waitForScreen()` methods
   - Dismiss alerts before interacting with elements

4. **Keyboard Issues**
   - Dismiss keyboard before scrolling or tapping other elements
   - Use `browser.pause()` after keyboard interactions

### Debugging Commands

```typescript
// Print page source
await browser.getPageSource();

// Take screenshot
await browser.takeScreenshot();

// Get element attributes
await element.getAttribute('label');
await element.getAttribute('name');

// Check if element exists
await element.isDisplayed();
await element.isEnabled();
```

## Configuration

### WebdriverIO Config

The main configuration is in `config/wdio.conf.ts`:
- **Framework**: Mocha
- **Platform**: iOS (XCUITest)
- **Device**: iPhone SE (3rd generation)
- **App**: `XQFitness.app`
- **Timeout**: 360000ms (6 minutes)

### Running Tests

```bash
# Run all tests (from mobile/)
yarn test:e2e

# Run specific test file (from mobile/)
yarn test:e2e --spec tests/manage-routine.spec.ts
```

## Additional Resources

- [WebdriverIO Documentation](https://webdriver.io/)
- [Appium XCUITest Driver](https://github.com/appium/appium-xcuitest-driver)
- [Mocha Framework](https://mochajs.org/)
- [Expect WebdriverIO](https://github.com/webdriverio/expect-webdriverio)

## Summary Checklist

When writing a new E2E test, ensure:

- [ ] Objects file created/updated with element selectors
- [ ] Page object created/updated with screen actions
- [ ] Task created/updated with business operations
- [ ] Test spec created with proper setup/teardown
- [ ] Resources tracked for cleanup
- [ ] Test data uses random strings
- [ ] UI variations handled (alerts, popups, keyboard)
- [ ] Proper waits implemented
- [ ] Error handling in place
- [ ] Test is independent and isolated
- [ ] Test name is descriptive
- [ ] Code follows naming conventions

