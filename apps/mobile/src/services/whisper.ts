import { callEdgeFunction } from "./edge-functions";

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

  return callEdgeFunction<{ text: string }>({
    functionName: "whisper-transcribe",
    body: formData,
  });
}
