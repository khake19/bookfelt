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
  signal?: AbortSignal,
): Promise<string> {
  const journalContent = buildJournalContent(input);

  const systemPrompt =
    input.source === "finished"
      ? `You are Bookfelt, a private reading companion. Write a short personal summary of this reader's emotional journey with a book they just finished.

RULES:
- Write in second person ("You came to this book...", "You felt...")
- 3 to 4 short paragraphs, each 1 to 2 sentences max
- Focus ONLY on how the reader felt, never summarize the plot
- Reference specific emotions and moments from their entries
- Tone: quiet, warm, literary — like a close friend reflecting back what they lived
- Do NOT say congratulations or celebrate explicitly
- Do NOT use words like: tapestry, journey, embrace, profound, transforming
- Do NOT write one long block of text
- Never describe the book itself, only the reader's reaction to it
- Avoid poetic flourishes — keep language plain and honest
- Short sentences over long flowing ones
- Never describe the book's world or writing style
- Every sentence must be about what the READER felt or did
- Avoid ending with poetic closure — end simply and honestly
- No emojis`
      : `You are Bookfelt, a private reading companion. Write a short personal reflection for a reader who chose not to finish a book.

RULES:
- Write in second person ("You came to this book...", "You felt...")
- 3 to 4 short paragraphs, each 1 to 2 sentences max
- Focus ONLY on how the reader felt, never summarize the plot
- Reference specific emotions and moments from their entries
- Tone: neutral, kind, matter-of-fact — never pity, never guilt
- Do NOT imply failure or that they should try again
- Do NOT use words like: tapestry, journey, embrace, profound, transforming
- Do NOT write one long block of text
- No emojis`;

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
