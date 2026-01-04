# 🔐 Configuración de Google OAuth con Supabase

## 📋 Pasos para configurar la autenticación con Google

### 1. Crea una aplicación en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en **"Crear proyecto"** (o selecciona uno existente)
3. Dale un nombre a tu proyecto (ej: "AsistenteIA")
4. Haz clic en **"Crear"**

### 2. Habilita la API de Google+ (OAuth)

1. En la barra de búsqueda, escribe **"Google+ API"**
2. Haz clic en **"Google+ API"** en los resultados
3. Haz clic en **"Habilitar"**

### 3. Crea las credenciales de OAuth

1. En el menú lateral, ve a **"Credenciales"**
2. Haz clic en **"+ Crear credenciales"**
3. Selecciona **"ID de OAuth de cliente"**
4. Te pedirá que configures una **"Pantalla de consentimiento OAuth"**:
   - Selecciona **"Externo"**
   - Haz clic en **"Crear"**
   - Completa los campos:
     - **Nombre de la aplicación**: AsistenteIA
     - **Email de soporte**: tu-email@ejemplo.com
     - **Emails de contacto del desarrollador**: tu-email@ejemplo.com
   - Haz clic en **"Guardar y continuar"**
5. En **"Permisos", haz clic en "Guardar y continuar"** (sin agregar permisos adicionales)
6. Revisa el resumen y haz clic en **"Volver a credenciales"**

### 4. Configura el cliente OAuth

1. En **"Credenciales"**, haz clic en **"+ Crear credenciales"** nuevamente
2. Selecciona **"ID de OAuth de cliente"**
3. Elige el tipo: **"Aplicación web"**
4. Completa:
   - **Nombre**: AsistenteIA Web
   - **URIs autorizados de JavaScript**:
     - `http://localhost:3000`
     - `https://tu-dominio.com` (cuando despliegues)
   - **URIs autorizados de redirección**:
     - `https://tu-supabase-url.supabase.co/auth/v1/callback`
     - (Para desarrollo local, Supabase maneja esto automáticamente)
5. Haz clic en **"Crear"**
6. Se abrirá una ventana con tus credenciales. Copia:
   - **ID de cliente**
   - **Secreto de cliente**

### 5. Configura Google OAuth en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el menú lateral, ve a **"Authentication"**
3. Haz clic en **"Providers"**
4. Busca y haz clic en **"Google"**
5. Activa el toggle de **"Enabled"**
6. Pega las credenciales:
   - **Client ID**: (del paso anterior)
   - **Client Secret**: (del paso anterior)
7. En **"Authorized redirect URIs"** en Supabase, asegúrate de tener:
   - `http://localhost:3000` (para desarrollo)
   - `https://tu-dominio.com` (para producción)
   - **IMPORTANTE**: No incluyas `/auth/callback` aquí - Supabase maneja eso internamente
8. Haz clic en **"Save"**

### 6. Configura las variables de entorno

Tu `.env.local` ya debería tener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

No necesitas agregar nada más - Supabase maneja todo por ti.

## ✅ Prueba la autenticación con Google

1. Reinicia el servidor: `npm run dev`
2. Ve a [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
3. Haz clic en **"Iniciar con Google"**
4. Selecciona tu cuenta de Google
5. ¡Deberías ser redirigido al chatbot automáticamente!

## 🔗 URLs de redirección importante

Para producción, necesitarás agregar estas URLs en:

### Google Cloud Console
- `https://tu-dominio.com/auth/callback`

### Supabase
En **Authentication > URL Configuration**:
- **Site URL**: `http://localhost:3000` (desarrollo) o `https://tu-dominio.com` (producción)
- **Redirect URLs**: Añade `http://localhost:3000/**` y `https://tu-dominio.com/**`

Asegúrate de agregar `https://` en producción.

## 🐛 Troubleshooting

### "No se puede conectar a Google"
- Verifica que las URIs de redirección sean exactas en Google Cloud
- Reinicia el servidor después de cambiar variables de entorno
- Verifica que Google OAuth esté habilitado en Supabase

### "Error de autenticación"
- Asegúrate de que ambas credenciales (ID y Secret) sean correctas
- Verifica que Google+ API esté habilitada en Google Cloud Console

### "Pantalla de consentimiento"
- Si aparece un mensaje de riesgo, es normal en desarrollo
- Haz clic en **"Continuar sin dudas"** o similar
- En producción, Google verificará tu aplicación

## 📱 Después de la autenticación

Una vez que el usuario se autentica con Google:
1. Supabase crea una nueva cuenta o vincula con una existente
2. El usuario es redirigido a `/chatbot`
3. La sesión se mantiene automáticamente

¡Listo! 🎉 Ahora tus usuarios pueden iniciar sesión con Google.
