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

    // Create a new FormData to send to the voice API
    const voiceApiFormData = new FormData();
    voiceApiFormData.append("audio", audioFile, "recording.webm");

    // Use the backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL || "https://ia-mayores-backend.vercel.app";
    const voiceApiUrl = `${backendUrl}/voice`;

    console.log("Attempting to send audio to:", voiceApiUrl);

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

      // Get the transcribed text from headers if available
      const transcribedText = voiceResponse.headers.get("X-Transcribed-Text") || "";
      const chatbotResponse = voiceResponse.headers.get("X-Chatbot-Response") || "";

      // Get the audio blob
      const audioBlob = await voiceResponse.blob();

      console.log("Voice API response received:", {
        transcribedText,
        chatbotResponse,
        audioBlobSize: audioBlob.size,
      });

      // Convert audio blob to base64 for JSON transmission
      const audioBuffer = await audioBlob.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");

      return NextResponse.json({
        text: transcribedText,
        response: chatbotResponse,
        audio: audioBase64,
        audioType: "audio/mpeg",
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
