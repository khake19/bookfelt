import { useState, useMemo, useCallback, useRef } from "react";
import * as entryService from "../services/entry.service";

const PAGE_SIZE = 20;

export function useRecentEntries() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const rawEntries = entryService.useObserveRecentEntries(limit);
  const hasMore = rawEntries.length >= limit;
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;

  const entries = useMemo(
    () => rawEntries.filter((e) => e.snippet || e.feeling),
    [rawEntries],
  );

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current) return;
    setLimit((prev) => prev + PAGE_SIZE);
  }, []);

  return { entries, loadMore, hasMore, removeEntry: entryService.removeEntry };
}
