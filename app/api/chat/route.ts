import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function GET() {
  return NextResponse.json(
    { error: "Método no permitido. Use POST." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, user_id, user_profile, tutor_profile, user_memory, latitude, longitude } = body as {
      message: string;
      history: ChatMessage[];
      user_id?: string | null;
      user_profile?: {
        name: string;
        number: string | null;
        description: string | null;
        interests: string | null;
        city: string | null;
      } | null;
      tutor_profile?: {
        name: string;
        number: string | null;
        description: string | null;
        instagram: string | null;
        facebook: string | null;
        relationship: string | null;
        factors: string | null;
      } | null;
      user_memory?: {
        facts: Array<{ text: string; category: string; created_at: string }>;
        narrative: string | null;
      } | null;
      latitude?: number | null;
      longitude?: number | null;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_URL no está configurada" },
        { status: 500 }
      );
    }

    const streamUrl = `${backendUrl}/chat/stream`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const backendResponse = await fetch(streamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message,
          history,
          user_id: user_id || null,
          user_profile: user_profile || null,
          tutor_profile: tutor_profile || null,
          user_memory: user_memory ?? null,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse
          .text()
          .catch(() => "Error desconocido del backend");
        return NextResponse.json(
          {
            error: `Error del backend: ${backendResponse.status} ${backendResponse.statusText}`,
            details: errorText,
          },
          { status: backendResponse.status }
        );
      }

      // Forward the SSE stream from backend to client
      const stream = backendResponse.body;
      if (!stream) {
        return NextResponse.json(
          { error: "No se recibió stream del backend" },
          { status: 500 }
        );
      }

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error al conectar con el backend:", fetchError);

      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Error desconocido";
      let userMessage = "No se pudo conectar con el backend";

      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          userMessage = "El backend tardó demasiado en responder (timeout)";
        } else if (errorMessage.includes("ECONNREFUSED")) {
          userMessage = "No se pudo conectar con el backend. ¿Está corriendo?";
        } else if (errorMessage.includes("ENOTFOUND")) {
          userMessage = "No se encontró el servidor del backend";
        }
      }

      return NextResponse.json(
        {
          error: userMessage,
          details: `URL intentada: ${streamUrl}. Error: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en el chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        error: "Ha ocurrido un error al procesar tu mensaje",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
