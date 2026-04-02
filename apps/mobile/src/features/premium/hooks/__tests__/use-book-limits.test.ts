import { mockCustomerInfo } from "@/test-utils/mocks/revenuecat";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useBookLimits } from "../use-book-limits";

// Mock the hooks that useBookLimits depends on
jest.mock("../use-premium-status", () => ({
  usePremiumStatus: jest.fn(),
}));

jest.mock("../../../books/hooks/use-library", () => ({
  useLibrary: jest.fn(),
}));

jest.mock("../../../entries", () => ({
  useEntries: jest.fn(),
}));

import { useLibrary } from "../../../books/hooks/use-library";
import { useEntries } from "../../../entries";
import { usePremiumStatus } from "../use-premium-status";

const mockUsePremiumStatus = usePremiumStatus as jest.MockedFunction<
  typeof usePremiumStatus
>;
const mockUseLibrary = useLibrary as jest.MockedFunction<typeof useLibrary>;
const mockUseEntries = useEntries as jest.MockedFunction<typeof useEntries>;

describe("useBookLimits - Premium Guard Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Summary Generation Guard", () => {
    const mockBook = (id: string, summary?: string) => ({
      id,
      title: "Test Book",
      authors: ["Test Author"],
      summary,
      status: "reading" as const,
      coverUrl: null,
      isbn: null,
      startedAt: Date.now(),
      finishedAt: null,
      rating: null,
      firstImpression: null,
      finalThought: null,
      exitNote: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const mockEntry = (id: string, reflectionUri?: string | null) => ({
      id,
      bookId: "book-1",
      date: Date.now(),
      snippet: null,
      reflection: "Test reflection",
      reflectionUri: reflectionUri ?? null,
      emotionId: null,
      setting: null,
      entryCreatedAt: Date.now(),
      updatedAt: Date.now(),
    });

    test("CRITICAL: Premium user can regenerate summaries", async () => {
      // Setup: Premium user with book that already has a summary
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1", "existing summary")],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: Array(5)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.summary.canGenerate).toBe(true);
      });

      expect(result.current.limits.summary.reason).toBeUndefined();
    });

    test("CRITICAL: Free user CANNOT regenerate summaries", async () => {
      // Setup: Free user with book that already has a summary
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1", "existing summary")],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: Array(5)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.summary.canGenerate).toBe(false);
      });

      expect(result.current.limits.summary.reason).toContain(
        "Upgrade to Premium",
      );
    });

    test("Free user can generate first summary", async () => {
      // Setup: Free user with book that has NO summary yet
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1")], // No summary
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: Array(5)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`)),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.summary.canGenerate).toBe(true);
      });
    });

    test("Returns correct premium status", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1")],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.isPremium).toBe(true);
        expect(result.current.isLoading).toBe(false);
      });
    });

    test("Book not found prevents summary generation", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [], // Book not found
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.summary.canGenerate).toBe(false);
      });
    });
  });

  describe("Audio Transcription Limits", () => {
    const mockBook = (id: string) => ({
      id,
      title: "Test Book",
      authors: ["Test Author"],
      status: "reading" as const,
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
    });

    const mockEntry = (id: string, reflectionUri?: string | null) => ({
      id,
      bookId: "book-1",
      date: Date.now(),
      snippet: null,
      reflection: "Test reflection",
      reflectionUri: reflectionUri ?? null,
      emotionId: null,
      setting: null,
      entryCreatedAt: Date.now(),
      updatedAt: Date.now(),
    });

    test("Premium user has unlimited audio transcriptions", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1")],
        isLoading: false,
      } as any);

      // Mock 20 entries with audio (more than free limit of 15)
      mockUseEntries.mockReturnValue({
        entries: Array(20)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`, "audio-uri")),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.audioTranscriptions.canUse).toBe(true);
        expect(result.current.limits.audioTranscriptions.remaining).toBe(
          Infinity,
        );
      });
    });

    test("Free user has 15 audio transcription limit", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1")],
        isLoading: false,
      } as any);

      // Mock 10 entries with audio
      mockUseEntries.mockReturnValue({
        entries: Array(10)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`, "audio-uri")),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.audioTranscriptions.used).toBe(10);
        expect(result.current.limits.audioTranscriptions.remaining).toBe(5);
        expect(result.current.limits.audioTranscriptions.canUse).toBe(true);
      });
    });

    test("Free user blocked when audio limit reached", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1")],
        isLoading: false,
      } as any);

      // Mock 15 entries with audio (at limit)
      mockUseEntries.mockReturnValue({
        entries: Array(15)
          .fill(null)
          .map((_, i) => mockEntry(`entry-${i}`, "audio-uri")),
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.audioTranscriptions.used).toBe(15);
        expect(result.current.limits.audioTranscriptions.remaining).toBe(0);
        expect(result.current.limits.audioTranscriptions.canUse).toBe(false);
      });
    });
  });

  describe("Bookends Limits", () => {
    const mockBook = (
      id: string,
      firstImpression?: string,
      finalThought?: string,
      exitNote?: string,
    ) => ({
      id,
      title: "Test Book",
      authors: ["Test Author"],
      status: "reading" as const,
      coverUrl: null,
      isbn: null,
      summary: null,
      startedAt: Date.now(),
      finishedAt: null,
      rating: null,
      firstImpression: firstImpression || null,
      finalThought: finalThought || null,
      exitNote: exitNote || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    test("Premium user has unlimited bookends", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        isLoading: false,
        customerInfo: mockCustomerInfo(true),
        refresh: jest.fn(),
      });

      // Mock books with more than 3 bookends total
      mockUseLibrary.mockReturnValue({
        books: [
          mockBook("book-1", "first", "final", "exit"),
          mockBook("book-2", "first", "final"),
        ],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.bookends.canUse).toBe(true);
        expect(result.current.limits.bookends.remaining).toBe(Infinity);
      });
    });

    test("Free user has 3 bookend limit across all books", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      // Mock books with 2 bookends total
      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1", "first", "final")],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.bookends.used).toBe(2);
        expect(result.current.limits.bookends.remaining).toBe(1);
        expect(result.current.limits.bookends.canUse).toBe(true);
      });
    });

    test("Free user blocked when bookend limit reached", async () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        isLoading: false,
        customerInfo: mockCustomerInfo(false),
        refresh: jest.fn(),
      });

      // Mock books with 3 bookends total (at limit)
      mockUseLibrary.mockReturnValue({
        books: [mockBook("book-1", "first", "final", "exit")],
        isLoading: false,
      } as any);

      mockUseEntries.mockReturnValue({
        entries: [],
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useBookLimits("book-1"));

      await waitFor(() => {
        expect(result.current.limits.bookends.used).toBe(3);
        expect(result.current.limits.bookends.remaining).toBe(0);
        expect(result.current.limits.bookends.canUse).toBe(false);
      });
    });
  });
});
