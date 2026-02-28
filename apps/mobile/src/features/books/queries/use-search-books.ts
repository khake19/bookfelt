import { useQuery } from "@tanstack/react-query";
import { searchGoogleBooks } from "@bookfelt/core";

export function useSearchBooks(query: string) {
  return useQuery({
    queryKey: ["books", "search", query],
    queryFn: () => searchGoogleBooks(query),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev,
  });
}
