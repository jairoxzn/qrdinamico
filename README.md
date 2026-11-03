# NFC Smart QR Manager — XhionSoft Technologies

Plataforma profesional de alta disponibilidad para la generación, personalización, gestión y analítica de **códigos QR dinámicos** y **tarjetas físicas con chips NFC** (NTAG213, NTAG215, NTAG216).

---

## 🚀 Arquitectura y Tecnologías Principales

- **Framework:** Next.js 14 con App Router y Server Actions
- **Lenguaje:** TypeScript 5.x
- **Estilos & UI:** Tailwind CSS con paleta corporativa (`#010B47`, `#025CF3`, `#FFFFFF`, `#F8FAFC`, `#111827`)
- **Iconografía:** Lucide React
- **Base de Datos:** PostgreSQL Serverless en Neon
- **ORM:** Prisma ORM 5.x
- **Autenticación & Sesión:** JWT ligero y seguro con `jose`, contraseñas encriptadas con `bcryptjs`, RBAC (`ADMIN` vs `CLIENT`)
- **Validaciones:** Zod + esquemas de seguridad
- **Visualización & Analítica:** Recharts (AreaCharts diarios, DonutCharts de dispositivos y plataformas)
- **Generación Gráfica:** Motor QR con personalización de módulos y ojos, descargas vectoriales SVG, PNG en alta definición y Fichas PDF para impresión (`jspdf`).

---

## 🔑 Credenciales de Acceso Demo (Preconfiguradas en Base de Datos)

El formulario de inicio de sesión (`/login`) incluye botones de **acceso rápido en 1-clic**:

### 1. Administrador de Plataforma
- **Correo:** `admin@xhionsoft.com`
- **Contraseña:** `adminpassword123`
- **Capacidades:** Control total, gestión de clientes corporativos, cuotas de códigos QR, catálogo completo y auditoría global.

### 2. Cliente Corporativo (Retail)
- **Correo:** `cliente@innovacion.com`
- **Contraseña:** `clientepassword123`
- **Capacidades:** Gestión exclusiva de sus códigos QR y tarjetas NFC asignadas, modificación de destinos en caliente, estadísticas de su tráfico.

---

## ⚡ Regla de Oro: Redirección Dinámica `/q/[code]`

1. **Desacoplamiento Total:** El código QR físico o el chip NFC grabado **NUNCA** almacena directamente la URL final. Solo contiene la URL corta permanente de la plataforma:  
   `http(s)://dominio/q/[identificador]`
2. **Respuesta HTTP 307 (Temporary Redirect):** Con encabezados `Cache-Control: no-store, no-cache, must-revalidate` para evitar que los navegadores almacenen el destino en memoria caché.
3. **Actualización Inmediata:** Cualquier cambio de URL realizado desde el dashboard se refleja en el siguiente escaneo sin necesidad de reimprimir el QR ni reescribir el chip NFC.
4. **Protección de Seguridad:** Validación estricta con filtrado de protocolos peligrosos (`javascript:`, `data:`, `file:`) y comprobación de estado (`ACTIVE` vs `SUSPENDED`).

---

## 📱 Simulación y Pruebas Físicas de NFC

La plataforma cuenta con un **Simulador de Lectura NFC en el navegador**:
- Permite seleccionar cualquier tarjeta NFC registrada con su UID físico.
- Muestra el registro NDEF que debe grabarse en el chip.
- Emula la aproximación física de un smartphone (Tap) abriendo `/q/[código]?src=nfc`, actualizando las analíticas en tiempo real y verificando la redirección en caliente.

---

## 🛠️ Comandos de Ejecución

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run prisma:generate

# Sincronizar base de datos Neon PostgreSQL
npm run prisma:push

# Poblar base de datos inicial con clientes, QRs y escaneos de muestra
npm run prisma:seed

# Ejecutar suite de pruebas automatizadas (18/18 pruebas E2E)
node test-e2e.js

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
npm run start
```

