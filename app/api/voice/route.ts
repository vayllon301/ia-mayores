import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from the form data
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No se proporcionó archivo de audio" },
        { status: 400 }
      );
    }

    console.log("Audio file received:", {
      type: audioFile.type,
      size: audioFile.size,
    });

    // Convert to a proper File object for FormData serialization
    const audioBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";
    const audioFileObj = new File([audioBuffer], "recording.webm", { type: mimeType });

    // Create a new FormData to send to the voice API
    const voiceApiFormData = new FormData();
    voiceApiFormData.append("audio", audioFileObj);

    // Use the voice API URL from environment variables
    const voiceApiUrl = process.env.VOICE_API_URL ||
      "https://menteviva-bwc9ejdthjhsfecn.swedencentral-01.azurewebsites.net/voice";

    console.log("Attempting to send audio to:", voiceApiUrl);
    console.log("Environment VOICE_API_URL:", process.env.VOICE_API_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for voice processing

    try {
      const voiceResponse = await fetch(voiceApiUrl, {
        method: "POST",
        body: voiceApiFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Voice API response status:", voiceResponse.status);
      console.log("Voice API response content-type:", voiceResponse.headers.get("content-type"));

      if (!voiceResponse.ok) {
        const errorText = await voiceResponse
          .text()
          .catch(() => "Error desconocido del API de voz");

        console.error("Voice API error response:", {
          status: voiceResponse.status,
          statusText: voiceResponse.statusText,
          body: errorText,
        });

        return NextResponse.json(
          {
            error: `Error del API de voz: ${voiceResponse.status} ${voiceResponse.statusText}`,
            details: errorText,
          },
          { status: voiceResponse.status }
        );
      }

      // Backend now returns JSON directly with full response
      const data = await voiceResponse.json();

      console.log("Voice API response received:", {
        text: data.text,
        responseLength: data.response?.length,
        hasAudio: !!data.audio,
      });

      // Pass through the JSON response directly
      return NextResponse.json({
        text: data.text || "",
        response: data.response || "",
        audio: data.audio || "",
        audioType: data.audioType || "audio/mpeg",
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error al conectar con el API de voz:", fetchError);

      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Error desconocido";
      let userMessage = "No se pudo conectar con el API de voz";

      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          userMessage = "El procesamiento de voz tardó demasiado (timeout)";
        } else if (errorMessage.includes("ECONNREFUSED")) {
          userMessage = "No se pudo conectar con el API de voz. ¿Está disponible?";
        } else if (errorMessage.includes("ENOTFOUND")) {
          userMessage = "No se encontró el servidor del API de voz";
        }
      }

      return NextResponse.json(
        {
          error: userMessage,
          details: `URL intentada: ${voiceApiUrl}. Error: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en el procesamiento de voz:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        error: "Ha ocurrido un error al procesar tu mensaje de voz",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
