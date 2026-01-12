import { NextRequest, NextResponse } from "next/server";

// Configuración del segmento de ruta para Next.js
export const runtime = 'nodejs'; // Especifica el runtime para Vercel
export const dynamic = 'force-dynamic'; // Fuerza el modo dinámico para evitar optimizaciones estáticas

// Prompt del sistema para el asistente de personas mayores
const SYSTEM_PROMPT = `Eres un asistente virtual amable y paciente, diseñado especialmente para ayudar a personas mayores.

REGLAS IMPORTANTES:
1. Usa un lenguaje claro, sencillo y respetuoso
2. Evita tecnicismos y jerga complicada
3. Responde de forma breve y directa
4. Sé muy paciente y comprensivo
5. Ofrece ayuda adicional si es necesario
6. Usa un tono cálido y cercano, como si hablaras con un amigo
7. Si no entiendes algo, pide amablemente que te lo expliquen de otra forma
8. Divide las instrucciones largas en pasos simples
9. Felicita y anima cuando sea apropiado
10. Responde siempre en español

TEMAS EN LOS QUE PUEDES AYUDAR:
- Preguntas generales del día a día
- Información sobre salud y bienestar (sin dar consejos médicos)
- Ayuda con tecnología básica
- Compañía y conversación amigable
- Recordatorios y organización
- Cualquier duda que puedan tener

Recuerda: tu objetivo es hacer que la persona se sienta cómoda, escuchada y acompañada.`;

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

    // Intentar conectar con el backend externo primero
    try {
      const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
      const backendResponse = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history,
        }),
        // Timeout de 30 segundos
        signal: AbortSignal.timeout(30000),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json({ response: data.response || data.message });
      }
    } catch (backendError) {
      console.error("Backend no disponible, usando fallback:", backendError);
      // Continuar con fallback si el backend no responde
    }

    // Fallback: Usar OpenAI si está configurado
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (openaiApiKey) {
      const response = await callOpenAI(message, history, openaiApiKey);
      return NextResponse.json({ response });
    } else {
      // Respuesta de demostración si no hay API key
      const demoResponse = generateDemoResponse(message);
      return NextResponse.json({ response: demoResponse });
    }
  } catch (error) {
    console.error("Error en el chat:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error al procesar tu mensaje" },
      { status: 500 }
    );
  }
}

// Función para llamar a la API de OpenAI
async function callOpenAI(
  message: string,
  history: ChatMessage[],
  apiKey: string
): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10), // Últimos 10 mensajes para contexto
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error("Error en la API de OpenAI");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Respuestas de demostración cuando no hay API key
function generateDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Respuestas contextuales básicas
  if (lowerMessage.includes("hola") || lowerMessage.includes("buenos")) {
    return "¡Hola! 😊 Me alegra mucho saludarte. ¿Cómo estás hoy? ¿En qué puedo ayudarte?";
  }

  if (lowerMessage.includes("cómo estás") || lowerMessage.includes("qué tal")) {
    return "¡Estoy muy bien, gracias por preguntar! 😊 Siempre listo para ayudarte. ¿Y tú cómo te encuentras hoy?";
  }

  if (lowerMessage.includes("gracias")) {
    return "¡De nada! 😊 Ha sido un placer ayudarte. Si necesitas algo más, aquí estaré.";
  }

  if (lowerMessage.includes("adiós") || lowerMessage.includes("hasta luego")) {
    return "¡Hasta pronto! 👋 Ha sido muy agradable hablar contigo. Cuídate mucho y vuelve cuando quieras.";
  }

  if (lowerMessage.includes("tiempo") || lowerMessage.includes("clima")) {
    return "Para saber el tiempo que hace, te recomiendo mirar por la ventana o consultar una aplicación del tiempo en tu teléfono. ¿Necesitas ayuda con algo más?";
  }

  if (lowerMessage.includes("hora") || lowerMessage.includes("fecha")) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return `Ahora mismo son las ${now.toLocaleString("es-ES", options)}. ¿Puedo ayudarte con algo más?`;
  }

  if (lowerMessage.includes("ayuda") || lowerMessage.includes("puedes hacer")) {
    return `¡Con mucho gusto te cuento! 😊 Puedo ayudarte con:

• Responder preguntas generales
• Tener una conversación agradable contigo
• Darte información sobre diferentes temas
• Ayudarte a recordar cosas importantes

¿Hay algo específico en lo que pueda echarte una mano?`;
  }

  if (lowerMessage.includes("nombre") || lowerMessage.includes("quién eres")) {
    return "Soy tu asistente virtual 🤖, diseñado especialmente para ayudarte y hacerte compañía. Puedes preguntarme lo que quieras, ¡estoy aquí para ti!";
  }

  // Respuesta genérica amigable
  const genericResponses = [
    "¡Qué interesante lo que me cuentas! 😊 ¿Podrías explicarme un poco más para poder ayudarte mejor?",
    "Entiendo. ¿Hay algo específico en lo que pueda echarte una mano?",
    "Gracias por compartir eso conmigo. ¿Cómo puedo ayudarte con esto?",
    "Me encanta charlar contigo. ¿Hay algo más que quieras preguntarme?",
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
