import Link from "next/link";

/* ——— Inline SVG Icons ——— */
function LogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="url(#logo-grad)" />
      <path d="M24 12c-5.5 0-10 4-10 9 0 3 1.5 5.6 3.8 7.2.2.2.2.4.2.7l-.5 3.1c-.1.5.4.9.8.7l3.3-1.5c.2-.1.4-.1.6 0 .6.1 1.2.2 1.8.2 5.5 0 10-4 10-9s-4.5-9-10-9z" fill="white" opacity="0.95"/>
      <circle cx="19.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="24" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <circle cx="28.5" cy="20.5" r="1.5" fill="#1a7a6d"/>
      <path d="M15.5 14.5c1-2.5 4-4.5 8.5-4.5s7.5 2 8.5 4.5" stroke="#e8985e" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a7a6d"/>
          <stop offset="1" stopColor="#22a196"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function EaseIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="14" r="6" stroke="#1a7a6d" strokeWidth="2.5" fill="none"/>
      <path d="M10 32c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#1a7a6d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M26 12l3-3m0 0l3 3m-3-3v8" stroke="#e8985e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 34s-12-7.5-12-16c0-4.4 3.6-8 8-8 2.8 0 5.2 1.4 6.5 3.5h-5l4 4.5 4-4.5h-5C22 11.4 24.4 10 27.2 10c4.4 0 8 3.6 8 8 0 8.5-12 16-12 16z" fill="none" stroke="#1a7a6d" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="16" cy="19" r="1.5" fill="#e8985e"/>
      <circle cx="24" cy="19" r="1.5" fill="#e8985e"/>
      <path d="M17 24c1.5 2 4.5 2 6 0" stroke="#e8985e" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4L6 10v10c0 9 6 16 14 18 8-2 14-9 14-18V10L20 4z" stroke="#1a7a6d" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M14 20l4 4 8-8" stroke="#e8985e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="6" width="8" height="16" rx="4" stroke="#1a7a6d" strokeWidth="2.5" fill="none"/>
      <path d="M10 20c0 5.5 4.5 10 10 10s10-4.5 10-10" stroke="#1a7a6d" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="20" y1="30" x2="20" y2="36" stroke="#1a7a6d" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M15 36h10" stroke="#e8985e" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-main)' }}>
      {/* Header */}
      <header className="w-full py-5 px-6 md:px-12 sticky top-0 z-50 glass-card">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <LogoIcon className="w-11 h-11" />
            <div>
              <span className="text-xl font-bold block leading-tight" style={{ color: 'var(--color-primary)' }}>
                MenteViva
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                IA para ti
              </span>
            </div>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="btn btn-secondary hidden md:flex"
              style={{ minHeight: '48px', minWidth: '100px', padding: '0.75rem 1.5rem' }}
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="btn btn-primary"
              style={{ minHeight: '48px', minWidth: '100px', padding: '0.75rem 1.5rem' }}
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content" className="px-6 md:px-12">
        {/* Hero */}
        <section className="gradient-hero rounded-b-[3rem] -mx-6 md:-mx-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto py-20 md:py-32">
            <div className="text-center max-w-3xl mx-auto">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
                style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1l2 3h3l-2.5 3L12 11l-4-2-4 2 1.5-4L3 4h3L8 1z" fill="currentColor"/>
                </svg>
                <span className="text-sm font-semibold">Inteligencia artificial al servicio de las personas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.1] animate-fade-in" style={{ color: 'var(--color-text-primary)', animationDelay: '0.1s', animationFillMode: 'both' }}>
                Tu compañero digital,{" "}
                <span className="gradient-warm bg-clip-text" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  siempre a tu lado
                </span>
              </h1>

              <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto animate-fade-in" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', animationDelay: '0.2s', animationFillMode: 'both' }}>
                Un asistente amable y fácil de usar, diseñado especialmente para ti.
                Pregunta lo que quieras, cuando quieras.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <Link
                  href="/auth/register"
                  className="btn btn-primary text-xl px-10 py-5 w-full sm:w-auto"
                  style={{ minWidth: '250px' }}
                >
                  Comenzar gratis
                  <ArrowRightIcon />
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
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-6xl mx-auto py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-accent)' }}>
              Pensado para ti
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ¿Por qué elegir MenteViva?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <EaseIcon />,
                title: "Fácil de usar",
                desc: "Letras grandes, botones claros y sin complicaciones técnicas.",
                color: "#e8f4f0",
              },
              {
                icon: <HeartIcon />,
                title: "Siempre amable",
                desc: "Un asistente paciente que responde con cariño y claridad.",
                color: "#fce8d5",
              },
              {
                icon: <ShieldIcon />,
                title: "Seguro y privado",
                desc: "Tus conversaciones están protegidas. Solo tú las ves.",
                color: "#e8f4f0",
              },
              {
                icon: <VoiceIcon />,
                title: "Habla con tu voz",
                desc: "Graba mensajes de voz si prefieres no escribir.",
                color: "#fce8d5",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="card text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: benefit.color }}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {benefit.title}
                </h3>
                <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-accent)' }}>
              Muy sencillo
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                num: "1",
                title: "Crea tu cuenta",
                desc: "Solo necesitas un correo electrónico y una contraseña. Es gratis y rápido.",
              },
              {
                num: "2",
                title: "Inicia sesión",
                desc: "Entra con tu correo o con Google cuando quieras hablar con el asistente.",
              },
              {
                num: "3",
                title: "¡Pregunta lo que quieras!",
                desc: "Escribe o habla, y el asistente te responderá con amabilidad y claridad.",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-6 relative">
                {/* Connecting line */}
                {i < 2 && (
                  <div
                    className="absolute left-[31px] top-[64px] w-[2px] h-[calc(100%-32px)]"
                    style={{ background: 'var(--color-border)' }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold relative z-10 gradient-primary text-white"
                  style={{ boxShadow: '0 4px 12px rgba(26, 122, 109, 0.25)' }}
                >
                  {step.num}
                </div>
                <div className="pb-12">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto py-16 mb-8">
          <div
            className="card gradient-warm text-center relative overflow-hidden"
            style={{ border: 'none', padding: '3rem 2rem' }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                ¿Listo para comenzar?
              </h2>
              <p className="text-xl mb-10 text-white" style={{ opacity: 0.9 }}>
                Regístrate ahora y empieza a conversar con tu nuevo compañero inteligente.
              </p>
              <Link
                href="/auth/register"
                className="btn text-xl px-10 py-5 inline-flex items-center gap-2 font-bold"
                style={{
                  background: 'white',
                  color: 'var(--color-primary)',
                  minWidth: '280px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                }}
              >
                Crear mi cuenta gratis
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12" style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoIcon className="w-8 h-8" />
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>MenteViva</span>
            </div>
            <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
              © 2026 MenteViva — Inteligencia artificial al servicio de las personas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
