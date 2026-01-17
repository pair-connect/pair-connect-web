# Configuración de Notificaciones por Email

Este documento explica cómo configurar las notificaciones por email en Pair Connect.

## 📧 Servicio de Email

El sistema usa **Resend** para enviar emails, pero puedes usar cualquier otro servicio (SendGrid, Mailgun, etc.).

## 🔧 Configuración

### 1. Obtener API Key de Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Crea un API Key en el dashboard
3. Copia el API Key

### 2. Configurar Variable de Entorno en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Settings** → **Edge Functions** → **Secrets**
3. Agrega una nueva variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Tu API Key de Resend

### 3. Desplegar la Edge Function

```bash
# Desde la raíz del proyecto
supabase functions deploy send-email
```

## 📨 Emails que se Envían

### 1. Nueva Solicitud de Participación
- **Cuándo**: Cuando alguien muestra interés en un proyecto
- **Para**: El owner del proyecto
- **Contenido**: Información del solicitante y link para gestionar solicitudes

### 2. Solicitud Aceptada
- **Cuándo**: Cuando el owner acepta una solicitud
- **Para**: El solicitante
- **Contenido**: Confirmación y link al proyecto

## 🧪 Testing

Para probar sin configurar Resend, la función simplemente loguea los emails en la consola. Esto es útil para desarrollo.

## 🔄 Usar Otro Servicio de Email

Si prefieres usar otro servicio (SendGrid, Mailgun, etc.), modifica `supabase/functions/send-email/index.ts`:

```typescript
// Ejemplo con SendGrid
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [{ type: "text/html", value: html }],
  }),
});
```

## 📝 Notas

- Los emails se envían de forma asíncrona y no bloquean la respuesta de la API
- Si falla el envío de email, la operación principal (crear solicitud, aceptar, etc.) sigue funcionando
- Los errores de email se loguean pero no afectan la experiencia del usuario
