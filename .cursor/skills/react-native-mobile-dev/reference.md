# React Native Mobile Dev – Reference

## Unit Test Examples

### Screen with mocked API

```javascript
import { renderScreen } from '../utils/test-utils';
import { mockRoutines } from '../fixtures/routines';
import * as api from '../../src/services/api';

jest.mock('../../src/services/api');

it('displays routines after loading', async () => {
  api.getRoutines.mockResolvedValue(mockRoutines);
  const { getByText, queryByTestId } = renderScreen(RoutineListScreen);

  await waitFor(() => expect(queryByTestId('loading-indicator')).toBeNull());
  expect(getByText('Push Pull Legs')).toBeTruthy();
});
```

### Testing navigation

```javascript
it('navigates on button tap', async () => {
  api.getRoutines.mockResolvedValue([]);
  const { getByTestId, navigation } = renderScreen(RoutineListScreen);

  await waitFor(() => expect(getByTestId('create-routine-button')).toBeTruthy());
  fireEvent.press(getByTestId('create-routine-button'));
  expect(navigation.navigate).toHaveBeenCalledWith('CreateRoutine');
});
```

### Testing with route params

```javascript
const { getByText } = renderScreen(RoutineDetailScreen, {
  routeParams: { routineId: 1 },
});
```

## Integration Test Examples

### Screen with real API

```javascript
import { renderScreenWithApi, waitForLoadingToFinish } from './helpers/test-utils';

it('displays data from API', async () => {
  const { getByText, queryByTestId } = renderScreenWithApi(RoutineListScreen);
  await waitForLoadingToFinish(queryByTestId, 'loading-indicator');
  // Assert on actual API response
});
```

### Creating test data

```javascript
import { createTestRoutine, renderScreenWithApi } from './helpers/test-utils';

const routine = await createTestRoutine({
  name: 'Test Routine',
  workoutDays: [{ dayNumber: 1, dayName: 'Push' }],
});
```

## UX Patterns

### Loading state

```javascript
if (loading) {
  return <ActivityIndicator testID="loading-indicator" size="large" />;
}
```

### Empty state

```javascript
{data.length === 0 && (
  <View testID="empty-state">
    <Text>No items found</Text>
    <TouchableOpacity testID="create-button" onPress={onCreate}>
      <Text>Create</Text>
    </TouchableOpacity>
  </View>
)}
```

### Error handling

```javascript
try {
  await apiCall();
} catch (error) {
  Alert.alert('Error', 'Something went wrong. Please try again.');
}
```

## Test ID Conventions

| Element | testID pattern |
|---------|----------------|
| Screen container | `{screen-name}-screen` |
| Loading | `loading-indicator` |
| Empty state | `empty-state` |
| List | `{entity}-list` |
| List item | `{entity}-item-{id}` |
| Item touchable | `{entity}-item-touchable-{id}` |
| Create button | `create-{entity}-button` |
| Edit button | `edit-{entity}-{id}` |
| Delete button | `delete-{entity}-{id}` |
