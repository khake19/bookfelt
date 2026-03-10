const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

export async function transcribeAudio(
  fileUri: string,
  fileName: string
): Promise<{ text: string }> {
  const formData = new FormData();

  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: "audio/m4a",
  } as any);
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  return response.json() as Promise<{ text: string }>;
}
