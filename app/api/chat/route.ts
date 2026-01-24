import { NextRequest, NextResponse } from "next/server";

// Configuración del segmento de ruta para Next.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tipo para los mensajes del historial
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Manejar métodos no permitidos
export async function GET() {
  return NextResponse.json(
    { error: "Método no permitido. Use POST." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message: string;
      history: ChatMessage[];
    };

    // Validación básica
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    // Obtener la URL del backend desde las variables de entorno
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_URL no está configurada" },
        { status: 500 }
      );
    }

   
    const chatUrl = `${backendUrl}/chat`;

    // Conectar con el backend FastAPI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const backendResponse = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message,
          history,
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

      const data = await backendResponse.json();
      return NextResponse.json({
        response: data.response || data.message || data,
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
          details: `URL intentada: ${chatUrl}. Error: ${errorMessage}`,
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
