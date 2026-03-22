# Premium Guard Tests

## Overview

These tests protect the **critical business logic** that controls access to premium features. Bugs in these guards can lead to:

- ❌ Free users getting premium features (revenue loss)
- ❌ Premium users being blocked from features they paid for (bad UX, refunds)

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (recommended during development)
pnpm test:watch

# With coverage report
pnpm test:coverage
```

## Test Files

### 1. `use-book-limits.test.ts` - Premium Guard Logic
**Critical tests for the core access control**

- ✅ Premium users can regenerate summaries
- ✅ Free users CANNOT regenerate summaries
- ✅ Free users get first summary free
- ✅ Audio transcription limits (15 for free, unlimited for premium)
- ✅ Bookends limits (3 for free, unlimited for premium)

**Why these matter:**
These tests catch bugs like the ones we fixed:
- Premium status loading race condition
- Incorrect destructuring (`limits.isPremium` vs `isPremium`)

### 2. `use-book-summary.test.ts` - 5-Entry Minimum & Loading States
**Tests for the summary generation quality gate**

- ✅ Blocks when < 5 entries (singular "entry")
- ✅ Blocks when < 5 entries (plural "entries")
- ✅ 5-entry rule applies to BOTH free and premium users
- ✅ Waits for premium status to load before checking limits
- ✅ Premium user blocked by entry count, not existing summary

**Why these matter:**
These tests catch:
- The singular/plural "entry" vs "entries" UI bug
- Race conditions where premium status hasn't loaded yet
- Quality gate bypasses

## Mock Files

### `mocks/revenuecat.ts`
Mocks RevenueCat SDK for premium status testing

**Usage:**
```typescript
import { mockCustomerInfo, mockPurchases } from './mocks/revenuecat';

// Simulate premium user
mockPurchases.getCustomerInfo.mockResolvedValue(mockCustomerInfo(true));

// Simulate free user
mockPurchases.getCustomerInfo.mockResolvedValue(mockCustomerInfo(false));
```

## Test Philosophy

1. **Guard tests are NON-NEGOTIABLE** - These protect revenue and customer trust
2. **Test both happy and sad paths** - Don't just test success cases
3. **Test edge cases** - Singular/plural, loading states, race conditions
4. **Keep tests simple** - Each test should verify ONE thing
5. **Mock external dependencies** - RevenueCat, WatermelonDB, etc.

## Adding New Premium Features

When adding new premium features:

1. **Add guard logic** to `use-book-limits.ts`
2. **Write tests FIRST** for the new guard
3. **Test both free and premium paths**
4. **Test loading states** if async

Example:
```typescript
// New feature: "recaps"
test('Premium user has unlimited recaps', async () => {
  mockUsePremiumStatus.mockReturnValue({
    isPremium: true,
    isLoading: false,
    customerInfo: mockCustomerInfo(true),
    refresh: jest.fn(),
  });

  const { result } = renderHook(() => useBookLimits('book-1'));

  await waitFor(() => {
    expect(result.current.limits.recaps.canGenerate).toBe(true);
    expect(result.current.limits.recaps.remaining).toBe(Infinity);
  });
});
```

## Common Issues

### Tests failing with "Cannot find module"
Make sure path aliases are configured in `jest.config.cts`:
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### RevenueCat mock not working
Import the mock BEFORE importing the hook:
```typescript
import { mockPurchases } from './mocks/revenuecat';
import { useBookLimits } from '../use-book-limits';
```

### Async tests timing out
Use `waitFor` from `@testing-library/react-native`:
```typescript
await waitFor(() => {
  expect(result.current.isPremium).toBe(true);
});
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run Premium Guard Tests
  run: pnpm test --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

**Remember:** These guards protect your business. Treat them with care. 🔒
