import { useMutation } from "@tanstack/react-query";
import { searchGoogleBooksByIsbn } from "@bookfelt/core";

export function useIsbnLookup() {
  return useMutation({
    mutationFn: searchGoogleBooksByIsbn,
  });
}
