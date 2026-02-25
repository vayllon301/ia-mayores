"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// #region agent log
// Force dynamic rendering to prevent prerendering errors
export const dynamic = 'force-dynamic';
// #endregion

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/auth/profile";
  const [error, setError] = useState<string | null>(null);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/b1453c99-1cbf-43e3-aaf7-2380e5862220',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/page.tsx:18',message:'CallbackContent mounted',data:{next},timestamp:Date.now(),sessionId:'debug-session',runId:'build-debug',hypothesisId:'A'})}).catch(()=>{});
  }, [next]);
  // #endregion

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let subscription: { unsubscribe: () => void } | null = null;

    const handleAuthCallback = () => {
      try {
        // #region agent log
        const isBrowser = typeof window !== 'undefined';
        fetch('http://127.0.0.1:7242/ingest/b1453c99-1cbf-43e3-aaf7-2380e5862220',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/page.tsx:22',message:'handleAuthCallback entry',data:{isBrowser,hasWindow:isBrowser},timestamp:Date.now(),sessionId:'debug-session',runId:'build-debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        // Verificar si hay un error en el hash
        if (!isBrowser) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/b1453c99-1cbf-43e3-aaf7-2380e5862220',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/page.tsx:26',message:'Not in browser, skipping hash check',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'build-debug',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          return;
        }
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b1453c99-1cbf-43e3-aaf7-2380e5862220',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/page.tsx:32',message:'Hash params parsed',data:{hasError:!!errorParam,errorParam},timestamp:Date.now(),sessionId:'debug-session',runId:'build-debug',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        if (errorParam) {
          console.error("Error de OAuth:", errorParam, errorDescription);
          router.push(`/auth/login?error=oauth_failed&message=${encodeURIComponent(errorDescription || errorParam)}`);
          return;
        }

        // Escuchar cambios de autenticación de Supabase
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              // Usuario autenticado correctamente
              if (authSubscription) authSubscription.unsubscribe();
              router.push(next);
              router.refresh();
            } else if (event === 'SIGNED_OUT') {
              if (authSubscription) authSubscription.unsubscribe();
              router.push(`/auth/login?error=oauth_failed`);
            }
          }
        );

        subscription = authSubscription;

        // También verificar la sesión actual después de un breve delay
        // para manejar casos donde el evento ya se disparó
        timeoutId = setTimeout(async () => {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Error obteniendo sesión:", sessionError);
            if (subscription) subscription.unsubscribe();
            router.push(`/auth/login?error=oauth_failed`);
            return;
          }

          if (session) {
            if (subscription) subscription.unsubscribe();
            router.push(next);
            router.refresh();
          } else {
            // Esperar un poco más
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (subscription) subscription.unsubscribe();
              
              if (retrySession) {
                router.push(next);
                router.refresh();
              } else {
                setError("No se pudo establecer la sesión. Redirigiendo...");
                setTimeout(() => {
                  router.push(`/auth/login?error=oauth_failed`);
                }, 2000);
              }
            }, 1500);
          }
        }, 500);
      } catch (err) {
        console.error("Error en callback:", err);
        setError("Ha ocurrido un error. Redirigiendo...");
        setTimeout(() => {
          router.push(`/auth/login?error=oauth_failed`);
        }, 2000);
      }
    };

    handleAuthCallback();
    
    // Cleanup function
    return () => {
      if (subscription) subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, next]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: '#fef2f2' }}>
              ⚠️
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-error)' }}>
              Error
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-pulse" style={{ background: 'var(--color-primary)' }}>
              ⏳
            </div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Iniciando sesión...
            </h1>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Por favor espera un momento
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl animate-pulse" style={{ background: 'var(--color-primary)' }}>
            ⏳
          </div>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando...
          </p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
