import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No se proporcionó archivo de audio" },
        { status: 400 }
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";
    const audioFileObj = new File([audioBuffer], "recording.webm", { type: mimeType });

    const apiFormData = new FormData();
    apiFormData.append("audio", audioFileObj);

    const backendUrl = process.env.VOICE_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const transcribeUrl = `${backendUrl.replace(/\/voice$/, "")}/voice/transcribe`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for transcription only

    try {
      const response = await fetch(transcribeUrl, {
        method: "POST",
        body: apiFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Error desconocido");
        return NextResponse.json(
          { error: `Error transcribiendo: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ text: data.text || "" });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Error desconocido";
      const userMessage = fetchError instanceof Error && fetchError.name === "AbortError"
        ? "La transcripción tardó demasiado"
        : "No se pudo conectar con el servicio de transcripción";

      return NextResponse.json(
        { error: userMessage, details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al procesar el audio", details: errorMessage },
      { status: 500 }
    );
  }
}
