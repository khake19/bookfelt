import { useMutation } from "@tanstack/react-query";
import { searchGoogleBooksByIsbn } from "@/services/google-books";

export function useIsbnLookup() {
  return useMutation({
    mutationFn: searchGoogleBooksByIsbn,
  });
}
