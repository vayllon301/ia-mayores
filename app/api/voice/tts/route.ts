import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "No se proporcionó texto para convertir" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.VOICE_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const ttsUrl = `${backendUrl.replace(/\/voice$/, "")}/voice/tts`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for TTS

    try {
      const response = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voice || "nova" }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Error desconocido");
        return NextResponse.json(
          { error: `Error generando audio: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({
        audio: data.audio || "",
        audioType: data.audioType || "audio/ogg",
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Error desconocido";
      const userMessage = fetchError instanceof Error && fetchError.name === "AbortError"
        ? "La generación de audio tardó demasiado"
        : "No se pudo conectar con el servicio de audio";

      return NextResponse.json(
        { error: userMessage, details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al generar el audio", details: errorMessage },
      { status: 500 }
    );
  }
}
