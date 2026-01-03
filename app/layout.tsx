import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asistente IA para Mayores - Tu compañero digital",
  description: "Un asistente inteligente diseñado especialmente para personas mayores. Fácil de usar, siempre disponible y listo para ayudarte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {/* Skip link para accesibilidad */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
