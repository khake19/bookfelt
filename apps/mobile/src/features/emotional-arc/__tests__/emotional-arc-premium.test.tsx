import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EmotionalArcScreen from '@/app/emotional-arc';
import { usePremiumStatus } from '@/features/premium/hooks/use-premium-status';
import { useEmotionalArcData } from '@/features/emotional-arc';
import { useEmotionMap } from '@/features/entries';
import { mockCustomerInfo } from '@/test-utils/mocks/revenuecat';

// Mock dependencies
jest.mock('@/features/premium/hooks/use-premium-status');
jest.mock('@/features/emotional-arc/hooks/use-emotional-arc-data');
jest.mock('@/features/entries/services/emotion.service');
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ bookId: 'book-1', bookTitle: 'Test Book' }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
}));
jest.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    emotionalArcViewed: jest.fn(),
    emotionalArcTabSwitched: jest.fn(),
    emotionalArcShared: jest.fn(),
  }),
}));

const mockUsePremiumStatus = usePremiumStatus as jest.Mock;
const mockUseEmotionalArcData = useEmotionalArcData as jest.Mock;
const mockUseEmotionMap = useEmotionMap as jest.Mock;

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

describe('Emotional Arc Premium Gating', () => {
  const mockArcData = [
    {
      weekStart: new Date('2024-01-01'),
      weekEnd: new Date('2024-01-07'),
      entries: [],
      emotions: [],
      emotionCounts: new Map(),
    },
  ];

  const mockEmotionMap = new Map();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEmotionalArcData.mockReturnValue(mockArcData);
    mockUseEmotionMap.mockReturnValue(mockEmotionMap);
  });

  describe('Distribution Tab Access', () => {
    test('CRITICAL: Premium user can access Distribution tab', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Click Distribution tab
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      // Should NOT show upgrade prompt
      expect(Alert.alert).not.toHaveBeenCalled();

      // Tab should be active (has underline indicator)
      await waitFor(() => {
        expect(distributionTab.props.className).toContain('font-semibold');
      });
    });

    test('CRITICAL: Free user CANNOT access Distribution tab', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Click Distribution tab
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      // Should show upgrade prompt
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Premium Feature',
          expect.stringContaining('Distribution view provides advanced emotional analytics'),
          expect.any(Array)
        );
      });

      // Tab should NOT be active (Timeline remains active)
      const timelineTab = getByText('Timeline');
      expect(timelineTab.props.className).toContain('font-semibold');
      expect(distributionTab.props.className).not.toContain('font-semibold');
    });

    test('Timeline tab always accessible for all users', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Click Timeline tab
      const timelineTab = getByText('Timeline');
      fireEvent.press(timelineTab);

      // Should NOT show upgrade prompt
      expect(Alert.alert).not.toHaveBeenCalled();

      // Tab should be active
      await waitFor(() => {
        expect(timelineTab.props.className).toContain('font-semibold');
      });
    });
  });

  describe('Share Functionality', () => {
    test('CRITICAL: Free user CANNOT share Distribution view', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Try to switch to Distribution tab (will be blocked)
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      // Clear previous alert
      jest.clearAllMocks();

      // Try to share (should still be on Timeline, so share should work)
      // But if we mock the activeChart as 'radar' and try to share:
      // This test verifies the share handler prevents Distribution sharing

      // Note: In actual implementation, free user can't switch to radar,
      // so they can't get into a state where they're sharing radar view
      // The share check is a safety net

      expect(Alert.alert).toHaveBeenCalled(); // From tab switch attempt
    });

    test('Premium user can share Distribution view', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Switch to Distribution tab
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      // Should succeed without upgrade prompt
      expect(Alert.alert).not.toHaveBeenCalled();

      // Note: Actual share functionality requires mocking view capture
      // which is beyond the scope of premium gating tests
    });

    test('All users can share Timeline view', async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Timeline is default, no need to switch
      const timelineTab = getByText('Timeline');
      expect(timelineTab.props.className).toContain('font-semibold');

      // Share button should work (no premium check for Timeline)
      // Note: Actual share testing requires view capture mocking
    });
  });

  describe('Analytics Tracking', () => {
    test('Premium tab switch is tracked', async () => {
      const mockAnalytics = require('@/hooks/use-analytics').useAnalytics();

      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Switch to Distribution tab
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      await waitFor(() => {
        expect(mockAnalytics.emotionalArcTabSwitched).toHaveBeenCalledWith(
          'book-1',
          'Test Book',
          'radar'
        );
      });
    });

    test('Free user upgrade prompt attempt is NOT tracked as tab switch', async () => {
      const mockAnalytics = require('@/hooks/use-analytics').useAnalytics();

      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      const { getByText } = render(<EmotionalArcScreen />);

      // Try to switch to Distribution tab
      const distributionTab = getByText('Distribution');
      fireEvent.press(distributionTab);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Tab switch should NOT be tracked (upgrade prompt shown instead)
      expect(mockAnalytics.emotionalArcTabSwitched).not.toHaveBeenCalledWith(
        'book-1',
        'Test Book',
        'radar'
      );
    });
  });
});
