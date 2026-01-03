import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-main)' }}>
      {/* Cabecera */}
      <header className="w-full py-6 px-6 md:px-12" style={{ background: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}>
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: 'var(--color-primary)' }}>
              💬
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
              AsistenteIA
            </span>
          </div>
          
          <div className="flex gap-4">
            <Link 
              href="/auth/login"
              className="btn btn-secondary hidden md:flex"
            >
              Iniciar sesión
            </Link>
            <Link 
              href="/auth/register"
              className="btn btn-primary"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <main id="main-content" className="px-6 md:px-12">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Tu compañero digital,
              <br />
              <span style={{ color: 'var(--color-primary)' }}>siempre a tu lado</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              Un asistente amable y fácil de usar, diseñado especialmente para ti. 
              Pregunta lo que quieras, cuando quieras.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/auth/register"
                className="btn btn-primary text-xl px-10 py-5 w-full sm:w-auto"
                style={{ minWidth: '250px' }}
              >
                Comenzar ahora
              </Link>
              <Link 
                href="/auth/login"
                className="btn btn-secondary text-xl px-10 py-5 w-full sm:w-auto"
                style={{ minWidth: '250px' }}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="max-w-6xl mx-auto py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: 'var(--color-text-primary)' }}>
            ¿Por qué elegir nuestro asistente?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Beneficio 1 */}
            <div className="card text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: 'var(--color-bg-secondary)' }}>
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Fácil de usar
              </h3>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Diseñado con letras grandes y botones claros. 
                Sin complicaciones técnicas.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="card text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: 'var(--color-bg-secondary)' }}>
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Siempre amable
              </h3>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Un asistente paciente que responde con cariño 
                y claridad a todas tus preguntas.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="card text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: 'var(--color-bg-secondary)' }}>
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Seguro y privado
              </h3>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Tus conversaciones están protegidas. 
                Solo tú puedes ver lo que hablas.
              </p>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="max-w-4xl mx-auto py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: 'var(--color-text-primary)' }}>
            ¿Cómo funciona?
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Crea tu cuenta
                </h3>
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Solo necesitas un correo electrónico y una contraseña. Es gratis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Inicia sesión
                </h3>
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Entra con tu correo y contraseña cuando quieras hablar con el asistente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--color-primary)', color: 'white' }}>
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  ¡Pregunta lo que quieras!
                </h3>
                <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Escribe tu pregunta y el asistente te responderá con amabilidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="max-w-4xl mx-auto py-16 text-center">
          <div className="card" style={{ background: 'var(--color-primary)', border: 'none' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl mb-8 text-white opacity-90">
              Regístrate ahora y empieza a conversar con tu nuevo asistente.
            </p>
            <Link 
              href="/auth/register"
              className="btn text-xl px-10 py-5 inline-block"
              style={{ 
                background: 'white', 
                color: 'var(--color-primary)',
                minWidth: '250px'
              }}
            >
              Crear mi cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="py-8 px-6 md:px-12 mt-8" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            © 2026 AsistenteIA - Diseñado con ❤️ para personas mayores
          </p>
        </div>
      </footer>
    </div>
  );
}
