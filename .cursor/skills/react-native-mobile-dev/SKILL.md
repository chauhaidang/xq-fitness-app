---
name: react-native-mobile-dev
description: Guides mobile React Native development from requirements analysis through UX design, implementation, and full test coverage (unit, integration, e2e). Use when analyzing mobile requirements, designing screens, implementing features, or writing tests for React Native/Expo apps.
---

# React Native Mobile Development

End-to-end workflow for mobile feature development: analyze requirements → design UX → implement → test at all levels.

## 1. Requirements Analysis

Before implementation, clarify:

- **User story**: Who, what, why? (e.g., "As a user, I want to view my workout routines so I can track my progress")
- **Acceptance criteria**: Measurable, testable conditions
- **API contracts**: Endpoints, request/response shapes (check `api/*.yaml` or service specs)
- **Edge cases**: Empty states, errors, offline, slow network
- **Platform constraints**: iOS/Android differences, safe areas, keyboard handling

## 2. UX Design Principles

- **Touch targets**: Minimum 44×44 pt for interactive elements
- **Safe areas**: Use `SafeAreaView` or `react-native-safe-area-context` for notches/home indicator
- **Loading states**: Show spinners/skeletons; avoid blank screens
- **Empty states**: Clear message + primary action (e.g., "No routines found" + "Create Routine")
- **Error handling**: User-friendly alerts; retry when appropriate
- **Navigation**: Stack for flows; tabs for main sections; avoid deep nesting
- **Accessibility**: Add `accessibilityLabel`, `accessibilityHint`; support `testID` for automation

## 3. Implementation Patterns

### Screen structure

```javascript
// Typical screen: state, effects, handlers, render
const MyScreen = ({ navigation, route }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleAction = async () => { /* ... */ };

  if (loading) return <ActivityIndicator testID="loading-indicator" />;
  return (/* ... */);
};
```

### Test IDs

Add `testID` to key elements for tests:

- `loading-indicator`, `empty-state`, `error-state`
- `{entity}-list`, `{entity}-item-{id}`, `{entity}-item-touchable-{id}`
- `create-{entity}-button`, `edit-{entity}-{id}`, `delete-{entity}-{id}`

### API layer

Keep API calls in `src/services/api.js`; screens call these functions. Do not mock API in integration tests.

## 4. Testing Strategy

| Level | Purpose | Location | Run command |
|-------|---------|----------|-------------|
| **Unit** | Fast, isolated; mock API | `__tests__/screens/`, `__tests__/components/` | `npm run test:unit` |
| **Integration** | Real API; backend must be running | `__tests__/integration/` | `npm run test:integration` |
| **E2E** | Full app on device/simulator | Detox config | `detox test` |

### Unit tests

- Mock API: `jest.mock('../../src/services/api')`
- Use `renderScreen` from `__tests__/utils/test-utils.js` for screens
- Use `mockNavigation`, `mockRoute`, fixtures from `__tests__/fixtures/`
- Mock `Alert.alert` to auto-confirm when testing destructive actions

### Integration tests

- **No API mocks**; tests hit real gateway
- Use `renderScreenWithApi`, `waitForLoadingToFinish`, `waitForApiCall`, `createTestRoutine` from `__tests__/integration/helpers/test-utils.js`
- File naming: `*Screen.integration.test.js` or `*Flow.integration.test.js`
- Backend: run `xq-infra generate -f ./test-env` and `xq-infra up` before `npm run test:integration`

### E2E (Detox)

- Use for critical user flows on real/simulator builds
- Keep E2E suite small; rely on unit + integration for coverage

## 5. Workflow Checklist

```
Task Progress:
- [ ] Analyze requirements and acceptance criteria
- [ ] Confirm API contracts and edge cases
- [ ] Design UX (loading, empty, error states)
- [ ] Implement with testID on key elements
- [ ] Add unit tests (mocked API)
- [ ] Add integration tests (real API, if applicable)
- [ ] Run test:unit and test:integration
- [ ] Add/update E2E for critical flows (if needed)
```

## Additional Resources

- Integration test workflow: `.cursor/rules/integration-test.mdc`
- Isolated screen testing: `__tests__/ISOLATED_TESTING.md`
- Detailed patterns and examples: [reference.md](reference.md)
