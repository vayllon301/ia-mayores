import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "Método no permitido. Use POST." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_URL no está configurada" },
        { status: 500 }
      );
    }

    const alertUrl = `${backendUrl}/alert`;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional for alert requests
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const backendResponse = await fetch(alertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
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
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Error al enviar alerta al backend:", fetchError);

      const errorMessage =
        fetchError instanceof Error ? fetchError.message : "Error desconocido";
      let userMessage = "No se pudo enviar la alerta al backend";

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
          details: `URL intentada: ${alertUrl}. Error: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error en la alerta:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        error: "Ha ocurrido un error al procesar la alerta",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
