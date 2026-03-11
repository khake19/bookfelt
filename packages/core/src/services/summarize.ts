const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

interface SummaryInput {
  title: string;
  authors: string[];
  source: "finished" | "dnf";
  firstImpression?: string;
  finalThought?: string;
  exitNote?: string;
  entries: { snippet?: string; reflection?: string; feeling?: string }[];
}

export async function generateBookSummary(
  input: SummaryInput,
  signal?: AbortSignal
): Promise<string> {
  const journalContent = buildJournalContent(input);

  const systemPrompt =
    input.source === "finished"
      ? "You are a warm, literary companion celebrating a reader's completed journey. Write a short, heartfelt summary (3-5 sentences) reflecting on their experience with this book. Reference specific emotions or moments from their journal entries when available. Be celebratory but genuine. Do not use emojis."
      : "You are a gentle, understanding literary companion. The reader decided not to finish this book, and that's perfectly okay. Write a short, thoughtful reflection (3-5 sentences) acknowledging what they experienced and validating their choice. Reference specific thoughts from their entries when available. Be warm and non-judgmental. Do not use emojis.";

  const userPrompt = `Book: "${input.title}" by ${input.authors.join(", ")}
Status: ${input.source === "finished" ? "Completed" : "Did not finish"}

Reader's journal:
${journalContent || "No journal entries recorded."}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Summary generation failed: ${error}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0].message.content.trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function buildJournalContent(input: SummaryInput): string {
  const parts: string[] = [];

  if (input.firstImpression) {
    parts.push(`First Impression: "${stripHtml(input.firstImpression)}"`);
  }

  for (const entry of input.entries) {
    const lines: string[] = [];
    if (entry.snippet) lines.push(`Quote: "${stripHtml(entry.snippet)}"`);
    if (entry.reflection) lines.push(`Thought: ${stripHtml(entry.reflection)}`);
    if (entry.feeling) lines.push(`Feeling: ${entry.feeling}`);
    if (lines.length > 0) parts.push(lines.join("\n"));
  }

  if (input.finalThought) {
    parts.push(`Final Thought: "${stripHtml(input.finalThought)}"`);
  }

  if (input.exitNote) {
    parts.push(`Exit Note: "${stripHtml(input.exitNote)}"`);
  }

  return parts.join("\n\n");
}
