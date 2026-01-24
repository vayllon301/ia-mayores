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

    // Create a new FormData to send to the voice API
    const voiceApiFormData = new FormData();
    voiceApiFormData.append("audio", audioFile);

    // Send to the voice API
    const voiceApiUrl = "https://menteviva-bwc9ejdthjhsfecn.swedencentral-01.azurewebsites.net/voice";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for voice processing

    try {
      const voiceResponse = await fetch(voiceApiUrl, {
        method: "POST",
        body: voiceApiFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!voiceResponse.ok) {
        const errorText = await voiceResponse
          .text()
          .catch(() => "Error desconocido del API de voz");
        return NextResponse.json(
          {
            error: `Error del API de voz: ${voiceResponse.status} ${voiceResponse.statusText}`,
            details: errorText,
          },
          { status: voiceResponse.status }
        );
      }

      const data = await voiceResponse.json();
      return NextResponse.json({
        text: data.text || data.transcription || data.message || "",
        response: data.response || data,
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
