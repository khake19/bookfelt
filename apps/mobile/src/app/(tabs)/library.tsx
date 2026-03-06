import { useState } from "react";
import LottieView from "lottie-react-native";
import { Pressable, Text, View, ScrollView } from "react-native";

import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import LibraryBookRow from "../../features/books/components/LibraryBookRow";
import { useLibrary } from "../../features/books/hooks/use-library";
import type { ReadingStatus } from "../../features/books/types/book";
import { PillButton, ScreenWrapper } from "../../shared";
import { useRouter } from "expo-router";

type Filter = "all" | ReadingStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reading", label: "Reading" },
  { key: "want-to-read", label: "Want to Read" },
  { key: "finished", label: "Finished" },
];

const STATUS_ORDER: ReadingStatus[] = ["reading", "want-to-read", "finished"];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: "Currently Reading",
  "want-to-read": "Want to read",
  finished: "Finished",
};

export default function LibraryScreen() {
  const router = useRouter();
  const { books, removeBook, updateStatus } = useLibrary();
  const [filter, setFilter] = useState<Filter>("all");

  const filteredBooks =
    filter === "all" ? books : books.filter((b) => b.status === filter);

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    items: filteredBooks.filter((b) => b.status === status),
  })).filter((group) => group.items.length > 0);

  return (
    <ScreenWrapper>
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center justify-between mt-2 mb-3"
      >
        <Text className="text-foreground font-mono-bold text-xl">Library</Text>
        <PillButton
          icon="plus"
          label="Add Book "
          onPress={() => router.push("/add-book")}
          hitSlop={8}
        />
      </Animated.View>

      {books.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-1 items-center justify-center pb-20"
        >
          <LottieView
            source={require("../../assets/book.lottie")}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={{ width: 120, height: 120, backgroundColor: "transparent" }}
          />
          <Text className="text-muted text-sm mt-4 text-center leading-relaxed">
            Your library is empty.{"\n"}Tap + to add your first book.
          </Text>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 mb-2"
            >
              {FILTERS.map(({ key, label }) => {
                const active = filter === key;
                const count =
                  key === "all"
                    ? books.length
                    : books.filter((b) => b.status === key).length;
                if (key !== "all" && count === 0) return null;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setFilter(key)}
                    className={`px-3 py-1.5 rounded-full ${
                      active ? "bg-foreground" : "bg-card border border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        active ? "text-background" : "text-muted"
                      }`}
                    >
                      {label} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-6 gap-3"
          >
            {grouped.map((group, groupIndex) => (
              <Animated.View
                key={group.status}
                entering={FadeInDown.duration(400).delay(100 + groupIndex * 80)}
              >
                {filter === "all" && (
                  <Text className="text-xs font-medium uppercase tracking-widest text-muted mb-2 mt-2">
                    {group.label}
                  </Text>
                )}
                <View className="gap-3">
                  {group.items.map((book) => (
                    <LibraryBookRow
                      key={book.id}
                      book={book}
                      onPress={() =>
                        router.push({
                          pathname: "/book-detail",
                          params: { bookId: book.id },
                        })
                      }
                      onSetReading={() => updateStatus(book.id, "reading")}
                      onRemove={() => removeBook(book.id)}
                    />
                  ))}
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </>
      )}
    </ScreenWrapper>
  );
}
