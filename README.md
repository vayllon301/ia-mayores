# AsistenteIA - Asistente Virtual para Personas Mayores

Una aplicación web accesible diseñada especialmente para ayudar a personas mayores mediante un chatbot de inteligencia artificial.

## 🎯 Características

- **Landing Page**: Presentación clara del producto con diseño accesible
- **Autenticación**: Registro e inicio de sesión con Supabase
- **Chatbot IA**: Interfaz de chat amigable con un asistente virtual
- **Accesibilidad**: Tipografía grande, alto contraste, navegación simple

## 🛠️ Tecnologías

- **Frontend**: Next.js 16 (App Router)
- **Estilos**: TailwindCSS 4
- **Auth & DB**: Supabase
- **IA**: OpenAI API (opcional)
- **Lenguaje**: TypeScript

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd ia-mayores
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   # Supabase - Obtén estas credenciales en tu proyecto de Supabase
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

   # OpenAI (opcional - el chatbot funciona sin esto en modo demo)
   OPENAI_API_KEY=tu_openai_api_key
   ```

4. **Configura Supabase**
   
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Habilita la autenticación por email en Authentication > Providers
   - Copia la URL y la Anon Key desde Settings > API

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre la aplicación**
   
   Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
app/
├── page.tsx                 # Landing page
├── layout.tsx               # Layout principal
├── globals.css              # Estilos globales
├── auth/
│   ├── login/page.tsx       # Página de login
│   └── register/page.tsx    # Página de registro
├── chatbot/
│   └── page.tsx             # Página del chatbot (protegida)
└── api/
    └── chat/route.ts        # API para el chatbot

lib/
└── supabase/
    ├── client.ts            # Cliente Supabase (frontend)
    └── server.ts            # Cliente Supabase (backend)

middleware.ts                # Protección de rutas
```

## 🔐 Seguridad

- Las rutas del chatbot están protegidas por middleware
- Las sesiones son gestionadas por Supabase Auth
- Las claves sensibles nunca se exponen en el frontend
- Validación de inputs en formularios

## ♿ Accesibilidad

La aplicación está diseñada siguiendo las mejores prácticas de accesibilidad:

- Tamaños de letra grandes (base 18px)
- Alto contraste de colores
- Botones grandes y fáciles de pulsar
- Navegación por teclado
- Etiquetas ARIA para lectores de pantalla
- Skip links para navegación rápida
- Mensajes de error claros y descriptivos

## 🚀 Despliegue

### Vercel (recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega

### Otros proveedores

La aplicación es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- AWS Amplify

## 📝 Notas

- **Modo Demo**: Si no configuras `OPENAI_API_KEY`, el chatbot funcionará con respuestas predefinidas
- **Email de confirmación**: Supabase envía un email de confirmación al registrarse. Revisa la bandeja de spam

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

MIT
