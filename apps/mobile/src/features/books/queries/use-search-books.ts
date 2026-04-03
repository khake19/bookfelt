import { useQuery } from "@tanstack/react-query";
import { searchGoogleBooks } from "@/services/google-books";

export function useSearchBooks(
  query: string,
  orderBy?: "relevance" | "newest"
) {
  return useQuery({
    queryKey: ["books", "search", query, orderBy],
    queryFn: () => searchGoogleBooks(query, orderBy),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev,
  });
}
