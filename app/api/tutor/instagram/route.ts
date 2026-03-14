import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body as { username: string };

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "El nombre de usuario es requerido" },
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

    const response = await fetch(`${backendUrl}/tutor/instagram/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Error al vincular Instagram" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo vincular Instagram: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_URL no está configurada" },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/tutor/instagram/unlink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `No se pudo desvincular Instagram: ${message}` },
      { status: 500 }
    );
  }
}
