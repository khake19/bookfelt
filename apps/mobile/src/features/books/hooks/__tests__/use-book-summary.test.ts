import { renderHook, waitFor } from '@testing-library/react-native';
import { useBookSummary } from '../use-book-summary';

// Mock dependencies
jest.mock('../../services/library.service', () => ({
  fetchBook: jest.fn(),
  updateBook: jest.fn(),
}));

jest.mock('../../../entries/services/entry.service', () => ({
  fetchEntries: jest.fn(),
}));

jest.mock('@bookfelt/database', () => ({
  database: {
    get: jest.fn(() => ({
      query: jest.fn(() => ({
        fetch: jest.fn(),
      })),
    })),
  },
}));

jest.mock('@/services/summarize', () => ({
  generateBookSummary: jest.fn(),
}));

jest.mock('@/features/premium', () => ({
  useBookLimits: jest.fn(),
}));

import * as libraryService from '../../services/library.service';
import * as entryService from '../../../entries/services/entry.service';
import { generateBookSummary } from '@/services/summarize';
import { useBookLimits } from '@/features/premium';
import { database } from '@bookfelt/database';

const mockFetchBook = libraryService.fetchBook as jest.MockedFunction<
  typeof libraryService.fetchBook
>;
const mockFetchEntries = entryService.fetchEntries as jest.MockedFunction<
  typeof entryService.fetchEntries
>;
const mockGenerateBookSummary =
  generateBookSummary as jest.MockedFunction<typeof generateBookSummary>;
const mockUseBookLimits = useBookLimits as jest.MockedFunction<
  typeof useBookLimits
>;
const mockDatabase = database as jest.Mocked<typeof database>;

describe('useBookSummary - 5 Entry Minimum & Race Conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBook = {
    id: 'book-1',
    title: 'Test Book',
    authors: ['Test Author'],
    status: 'reading' as const,
    coverUrl: null,
    isbn: null,
    summary: null,
    startedAt: Date.now(),
    finishedAt: null,
    rating: null,
    firstImpression: null,
    finalThought: null,
    exitNote: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockEntry = (id: string) => ({
    id,
    bookId: 'book-1',
    date: Date.now(),
    snippet: 'Test snippet',
    reflection: 'Test reflection',
    reflectionUri: null,
    emotionId: 'happy',
    setting: null,
    entryCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });

  describe('5-Entry Minimum Requirement', () => {
    test('CRITICAL: Blocks when < 5 entries (singular "entry")', async () => {
      // Setup: Premium user with only 4 entries
      mockUseBookLimits.mockReturnValue({
        isPremium: true,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: true, // Premium can generate
            reason: undefined,
          },
          audioTranscriptions: { used: 0, limit: Infinity, remaining: Infinity, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: Infinity, remaining: Infinity, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue(mockBook);
      mockFetchEntries.mockResolvedValue(
        Array(4)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('blocked');
      });

      if (result.current.state.kind === 'blocked') {
        // Check for singular "entry" (4 entries = need 1 more)
        expect(result.current.state.reason).toContain('1 more entry');
        expect(result.current.state.reason).not.toContain('entries'); // Singular!
      }
    });

    test('CRITICAL: Blocks when < 5 entries (plural "entries")', async () => {
      // Setup: Premium user with only 3 entries
      mockUseBookLimits.mockReturnValue({
        isPremium: true,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: true,
            reason: undefined,
          },
          audioTranscriptions: { used: 0, limit: Infinity, remaining: Infinity, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: Infinity, remaining: Infinity, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue(mockBook);
      mockFetchEntries.mockResolvedValue(
        Array(3)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('blocked');
      });

      if (result.current.state.kind === 'blocked') {
        // Check for plural "entries" (3 entries = need 2 more)
        expect(result.current.state.reason).toContain('2 more entries');
      }
    });

    test('Allows generation when >= 5 entries', async () => {
      mockUseBookLimits.mockReturnValue({
        isPremium: true,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: true,
            reason: undefined,
          },
          audioTranscriptions: { used: 0, limit: Infinity, remaining: Infinity, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: Infinity, remaining: Infinity, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue(mockBook);
      mockFetchEntries.mockResolvedValue(
        Array(5)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      mockGenerateBookSummary.mockResolvedValue('Test summary');

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('done');
      });

      if (result.current.state.kind === 'done') {
        expect(result.current.state.text).toBe('Test summary');
      }
    });

    test('5-entry rule applies to both free and premium users', async () => {
      // Free user with 4 entries
      mockUseBookLimits.mockReturnValue({
        isPremium: false,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: true, // First summary, so allowed
            reason: undefined,
          },
          audioTranscriptions: { used: 0, limit: 15, remaining: 15, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: 3, remaining: 3, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue(mockBook);
      mockFetchEntries.mockResolvedValue(
        Array(4)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('blocked');
      });

      if (result.current.state.kind === 'blocked') {
        // Quality gate blocks everyone, not just free users
        expect(result.current.state.reason).toContain('entry');
      }
    });
  });

  describe('Race Condition: Premium Status Loading', () => {
    test('CRITICAL: Waits for premium status to load before checking limits', async () => {
      // Setup: Premium status is loading
      mockUseBookLimits.mockReturnValue({
        isPremium: false, // Default while loading
        isLoading: true, // Still loading!
        limits: {
          summary: {
            canGenerate: false, // Would be wrong if we checked now
            reason: 'Loading...',
          },
          audioTranscriptions: { used: 0, limit: 15, remaining: 15, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: 3, remaining: 3, canUse: true, reason: undefined },
        },
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      // Should stay in loading state
      expect(result.current.state.kind).toBe('loading');

      // Should NOT have made any API calls yet
      expect(mockFetchBook).not.toHaveBeenCalled();
      expect(mockFetchEntries).not.toHaveBeenCalled();
    });

    test('Generates summary after premium status loads', async () => {
      // Simulate loading then loaded state
      const { result, rerender } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      // Initially loading
      mockUseBookLimits.mockReturnValue({
        isPremium: false,
        isLoading: true,
        limits: {
          summary: { canGenerate: false, reason: undefined },
          audioTranscriptions: { used: 0, limit: 15, remaining: 15, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: 3, remaining: 3, canUse: true, reason: undefined },
        },
      } as any);

      expect(result.current.state.kind).toBe('loading');

      // Now simulate premium status loaded
      mockUseBookLimits.mockReturnValue({
        isPremium: true,
        isLoading: false,
        limits: {
          summary: { canGenerate: true, reason: undefined },
          audioTranscriptions: { used: 0, limit: Infinity, remaining: Infinity, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: Infinity, remaining: Infinity, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue(mockBook);
      mockFetchEntries.mockResolvedValue(
        Array(5)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      mockGenerateBookSummary.mockResolvedValue('Test summary');

      rerender();

      await waitFor(() => {
        expect(result.current.state.kind).toBe('done');
      });
    });
  });

  describe('Premium vs Free User Scenarios', () => {
    test('Premium user blocked by entry count, not by existing summary', async () => {
      mockUseBookLimits.mockReturnValue({
        isPremium: true,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: true, // Premium can regenerate
            reason: undefined,
          },
          audioTranscriptions: { used: 0, limit: Infinity, remaining: Infinity, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: Infinity, remaining: Infinity, canUse: true, reason: undefined },
        },
      } as any);

      mockFetchBook.mockResolvedValue({
        ...mockBook,
        summary: 'Existing summary', // Already has summary
      });
      mockFetchEntries.mockResolvedValue(
        Array(3)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)), // Only 3 entries
      );
      mockDatabase.get.mockReturnValue({
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('blocked');
      });

      if (result.current.state.kind === 'blocked') {
        // Should be blocked by entry count, not premium
        expect(result.current.state.reason).toContain('entries');
        expect(result.current.state.reason).not.toContain('Premium');
      }
    });

    test('Free user blocked by existing summary before entry count check', async () => {
      mockUseBookLimits.mockReturnValue({
        isPremium: false,
        isLoading: false,
        limits: {
          summary: {
            canGenerate: false, // Already has summary
            reason:
              "You've already generated a summary for this book. Upgrade to Premium to regenerate summaries!",
          },
          audioTranscriptions: { used: 0, limit: 15, remaining: 15, canUse: true },
          audioPlayback: { canSave: true, reason: undefined },
          bookends: { used: 0, limit: 3, remaining: 3, canUse: true, reason: undefined },
        },
      } as any);

      const { result } = renderHook(() =>
        useBookSummary('book-1', 'finished'),
      );

      await waitFor(() => {
        expect(result.current.state.kind).toBe('blocked');
      });

      if (result.current.state.kind === 'blocked') {
        expect(result.current.state.reason).toContain('Premium');
      }

      // Should NOT have fetched entries (blocked earlier)
      expect(mockFetchEntries).not.toHaveBeenCalled();
    });
  });
});
