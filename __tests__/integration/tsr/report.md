# E2E Test Results

## Summary

- **Status**: ✅ PASSED
- **Total Tests**: 53
- **Passed**: 53 ✅
- **Failed**: 0 ❌
- **Errors**: 0 ⚠️
- **Duration**: 27.90s

## Test Suites

### ✅ __tests__/integration/ManageWorkoutDayScreen.integration.test.js
**Duration**: 14.73s | **Tests**: 11 | **Failed**: 0

<details>
<summary>✅ Passed Tests (11)</summary>

- ✅ ManageWorkoutDayScreen Integration Tests renders form for creating new workout day (831ms)
- ✅ ManageWorkoutDayScreen Integration Tests loads muscle groups from API (235ms)
- ✅ ManageWorkoutDayScreen Integration Tests validates required fields (229ms)
- ✅ ManageWorkoutDayScreen Integration Tests validates day name is required (259ms)
- ✅ ManageWorkoutDayScreen Integration Tests validates at least one muscle group is selected (407ms)
- ✅ ManageWorkoutDayScreen Integration Tests creates workout day via API call (706ms)
- ✅ ManageWorkoutDayScreen Integration Tests converts routineId from string to integer when passed as string (423ms)
- ✅ ManageWorkoutDayScreen Integration Tests validates request body matches OpenAPI contract (315ms)
- ✅ ManageWorkoutDayScreen Integration Tests handles API errors gracefully (317ms)
- ✅ ManageWorkoutDayScreen Integration Tests pre-populates form when editing existing workout day (418ms)
- ✅ ManageWorkoutDayScreen Integration Tests updates existing workout day sets using workoutDayId and muscleGroupId query parameters (481ms)

</details>

### ✅ __tests__/integration/RoutineDetailScreen.integration.test.js
**Duration**: 3.75s | **Tests**: 8 | **Failed**: 0

<details>
<summary>✅ Passed Tests (8)</summary>

- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation completes full user journey: load routine -> create snapshot -> see success toast (429ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation handles error scenario: API failure shows error popup (328ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation acceptance scenario 1: saves all workout day details and sets data when creating snapshot (412ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation acceptance scenario 2: snapshot data remains unchanged when sets are modified later (418ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation acceptance scenario 3: only selected routine is snapshotted when multiple routines exist (418ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation acceptance scenario 4: original sets values remain unchanged after snapshot creation (418ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation edge case: handles snapshot creation when all sets are zero (390ms)
- ✅ RoutineDetailScreen Integration Tests - Snapshot Creation edge case: creating second snapshot for same week replaces the first (425ms)

</details>

### ✅ __tests__/integration/WeeklyReportScreen.integration.test.js
**Duration**: 2.52s | **Tests**: 8 | **Failed**: 0

<details>
<summary>✅ Passed Tests (8)</summary>

- ✅ WeeklyReportScreen Integration Tests completes full user journey: load report with snapshot data -> display muscle group totals (289ms)
- ✅ WeeklyReportScreen Integration Tests displays empty state when no snapshot exists (257ms)
- ✅ WeeklyReportScreen Integration Tests acceptance scenario 1: displays total sets per muscle group aggregated across all workout days (295ms)
- ✅ WeeklyReportScreen Integration Tests acceptance scenario 2: sums sets for muscle groups across multiple workout days (292ms)
- ✅ WeeklyReportScreen Integration Tests acceptance scenario 3: handles muscle groups with no sets (shows zero or omits) (267ms)
- ✅ WeeklyReportScreen Integration Tests acceptance scenario 4: shows report data only for selected routine (281ms)
- ✅ WeeklyReportScreen Integration Tests edge case: displays empty state when no snapshot exists (304ms)
- ✅ WeeklyReportScreen Integration Tests edge case: handles routine with workout days but no muscle group sets configured (299ms)

</details>

### ✅ __tests__/integration/RoutineListScreen.integration.test.js
**Duration**: 2.13s | **Tests**: 7 | **Failed**: 0

<details>
<summary>✅ Passed Tests (7)</summary>

- ✅ RoutineListScreen Integration Tests renders loading state initially (22ms)
- ✅ RoutineListScreen Integration Tests displays routines list after loading from API (747ms)
- ✅ RoutineListScreen Integration Tests displays empty state when API returns empty array (247ms)
- ✅ RoutineListScreen Integration Tests navigates to create routine screen on button tap (266ms)
- ✅ RoutineListScreen Integration Tests navigates to routine detail on routine item tap (259ms)
- ✅ RoutineListScreen Integration Tests refreshes list on pull to refresh (294ms)
- ✅ RoutineListScreen Integration Tests handles API errors gracefully (61ms)

</details>

### ✅ __tests__/integration/WeekBoundary.integration.test.js
**Duration**: 1.17s | **Tests**: 2 | **Failed**: 0

<details>
<summary>✅ Passed Tests (2)</summary>

- ✅ WeekBoundary Integration Tests week boundary: snapshot uses correct week start date (Monday) (407ms)
- ✅ WeekBoundary Integration Tests week boundary: handles snapshot creation and report viewing at week boundaries (584ms)

</details>

### ✅ __tests__/integration/SnapshotReportFlow.integration.test.js
**Duration**: 1.17s | **Tests**: 2 | **Failed**: 0

<details>
<summary>✅ Passed Tests (2)</summary>

- ✅ SnapshotReportFlow Integration Tests - End-to-End User Journeys end-to-end: create snapshot then view report shows snapshot data (612ms)
- ✅ SnapshotReportFlow Integration Tests - End-to-End User Journeys end-to-end: snapshot preserves data even after routine modifications (390ms)

</details>

### ✅ __tests__/integration/NavigationFlow.integration.test.js
**Duration**: 837ms | **Tests**: 2 | **Failed**: 0

<details>
<summary>✅ Passed Tests (2)</summary>

- ✅ NavigationFlow Integration Tests end-to-end: navigate from RoutineListScreen to report (244ms)
- ✅ NavigationFlow Integration Tests end-to-end: navigate from RoutineDetailScreen to snapshot creation (416ms)

</details>

### ✅ __tests__/integration/CreateRoutineScreen.integration.test.js
**Duration**: 648ms | **Tests**: 6 | **Failed**: 0

<details>
<summary>✅ Passed Tests (6)</summary>

- ✅ CreateRoutineScreen Integration Tests renders form correctly (35ms)
- ✅ CreateRoutineScreen Integration Tests validates required fields (20ms)
- ✅ CreateRoutineScreen Integration Tests submits form with valid data and calls API (171ms)
- ✅ CreateRoutineScreen Integration Tests handles API errors gracefully (72ms)
- ✅ CreateRoutineScreen Integration Tests navigates back after successful creation (70ms)
- ✅ CreateRoutineScreen Integration Tests validates request body matches OpenAPI contract (76ms)

</details>

### ✅ __tests__/integration/EditRoutineScreen.integration.test.js
**Duration**: 583ms | **Tests**: 7 | **Failed**: 0

<details>
<summary>✅ Passed Tests (7)</summary>

- ✅ EditRoutineScreen Integration Tests renders form with pre-populated data (27ms)
- ✅ EditRoutineScreen Integration Tests loads existing routine data from route params (17ms)
- ✅ EditRoutineScreen Integration Tests validates required fields (18ms)
- ✅ EditRoutineScreen Integration Tests updates routine via API call (101ms)
- ✅ EditRoutineScreen Integration Tests validates request body matches OpenAPI contract (72ms)
- ✅ EditRoutineScreen Integration Tests handles API errors gracefully (69ms)
- ✅ EditRoutineScreen Integration Tests navigates back after successful update (70ms)

</details>

