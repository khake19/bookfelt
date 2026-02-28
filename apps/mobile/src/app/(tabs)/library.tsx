import LottieView from "lottie-react-native";
import { useState } from "react";
import { Text, View, ScrollView } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import BookSearchInput from "../../features/books/components/BookSearchInput";
import BookSearchResults from "../../features/books/components/BookSearchResults";
import LibraryBookRow from "../../features/books/components/LibraryBookRow";
import type {
  Book,
  LibraryBook,
  ReadingStatus,
} from "../../features/books/types/book";
import { ScreenWrapper } from "../../shared";

const MOCK_RESULTS: Book[] = [
  {
    id: "1",
    title: "The Three-Body Problem",
    authors: ["Liu Cixin"],
    publishedDate: "2008",
    coverUrl:
      "https://books.google.com/books/content?id=ZrNzAwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    source: "google",
  },
  {
    id: "2",
    title: "The Dark Forest",
    authors: ["Liu Cixin"],
    publishedDate: "2015",
    source: "google",
  },
  {
    id: "3",
    title: "Death's End",
    authors: ["Liu Cixin"],
    publishedDate: "2016",
    coverUrl:
      "https://books.google.com/books/content?id=5qGJCwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    source: "google",
  },
];

const MOCK_LIBRARY: LibraryBook[] = [
  {
    id: "1",
    title: "The Three-Body Problem",
    authors: ["Liu Cixin"],
    coverUrl:
      "https://books.google.com/books/content?id=ZrNzAwAAQBAJ&printsec=frontcover&img=1&zoom=1",
    source: "google",
    status: "reading",
    currentChapter: 12,
    totalChapters: 35,
    addedAt: Date.now(),
  },
  {
    id: "4",
    title: "Norwegian Wood",
    authors: ["Haruki Murakami"],
    source: "google",
    status: "want-to-read",
    addedAt: Date.now(),
  },
  {
    id: "5",
    title: "Sapiens",
    authors: ["Yuval Noah Harari"],
    source: "google",
    status: "want-to-read",
    addedAt: Date.now(),
  },
  {
    id: "6",
    title: "Dune",
    authors: ["Frank Herbert"],
    source: "manual",
    status: "finished",
    addedAt: Date.now(),
  },
];

const ADDED_IDS = new Set(["3"]);
const STATUS_ORDER: ReadingStatus[] = ["reading", "want-to-read", "finished"];

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: "Currently Reading",
  "want-to-read": "Want to read",
  finished: "Finished",
};

export default function LibraryScreen() {
  const [query, setQuery] = useState("");

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    items: MOCK_LIBRARY.filter((b) => b.status === status),
  })).filter((group) => group.items.length > 0);

  return (
    <ScreenWrapper>
      <Animated.Text
        entering={FadeInDown.duration(400)}
        className="text-foreground font-mono-bold text-xl mt-2 mb-4"
      >
        Library
      </Animated.Text>
      {/* <Animated.View */}
      {/*   entering={FadeInDown.duration(500).delay(100)} */}
      {/*   className="mb-3" */}
      {/* > */}
      {/*   <BookSearchInput */}
      {/*     value={query} */}
      {/*     onChangeText={setQuery} */}
      {/*     onClear={() => setQuery("")} */}
      {/*   /> */}
      {/* </Animated.View> */}
      {/* <View className="flex-1"> */}
      {/*   <BookSearchResults */}
      {/*     results={MOCK_RESULTS} */}
      {/*     isLoading={false} */}
      {/*     error={null} */}
      {/*     query={query} */}
      {/*     isInLibrary={(id) => ADDED_IDS.has(id)} */}
      {/*     onSelectBook={() => undefined} */}
      {/*     onManualCreate={() => undefined} */}
      {/*   /> */}
      {/* </View> */}
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
          Your library is empty. {"\n"}Search for a book to get started.
        </Text>
      </Animated.View>
      {/* <ScrollView */}
      {/*   showsVerticalScrollIndicator={false} */}
      {/*   contentContainerClassName="pb-6" */}
      {/* > */}
      {/*   {grouped.map((group, groupIndex) => ( */}
      {/*     <Animated.View */}
      {/*       key={group.status} */}
      {/*       entering={FadeInDown.duration(400).delay(groupIndex * 100)} */}
      {/*     > */}
      {/*       <Text className="text-xs fornt-medium uppercase tracking-widest text-muted mb-2 mt-4"> */}
      {/*         {group.label} */}
      {/*       </Text> */}
      {/*       <View className="bg-card rounded-xl border border-border px-3"> */}
      {/*         {group.items.map((book, index) => ( */}
      {/*           <View key={book.id}> */}
      {/*             {index > 0 && <View className="h-px bg-border" />} */}
      {/*             <LibraryBookRow book={book} onSetReading={() => undefined} /> */}
      {/*           </View> */}
      {/*         ))} */}
      {/*       </View> */}
      {/*     </Animated.View> */}
      {/*   ))} */}
      {/* </ScrollView> */}
    </ScreenWrapper>
  );
}
