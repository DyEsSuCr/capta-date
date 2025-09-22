# API de Fechas Hábiles - Colombia

API REST desarrollada en TypeScript para calcular fechas hábiles en Colombia, considerando días festivos nacionales y horarios laborales específicos.

## 🚀 Características

- ✅ Cálculo de días y horas hábiles
- ✅ Manejo de zona horaria de Colombia (UTC-5)
- ✅ Exclusión automática de festivos colombianos
- ✅ Horario laboral: Lunes a Viernes, 8:00 AM - 5:00 PM (con almuerzo 12:00-1:00 PM)
- ✅ Respuestas en formato UTC ISO 8601
- ✅ Validación completa de parámetros
- ✅ Tipado completo en TypeScript

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

## 🛠️ Instalación

### Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd working-days-api
```

### Instalar dependencias
```bash
npm install
```

### Compilar TypeScript
```bash
npm run build
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```

### Ejecutar en modo producción
```bash
npm start
```

El servidor se ejecutará por defecto en el puerto 3000 (o el puerto especificado en la variable de entorno `PORT`).

## 📡 Uso de la API

### Endpoint
```
GET /
```
o
```
GET /calculate-working-time
```

### Parámetros Query String

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `days` | integer | No* | Número de días hábiles a sumar |
| `hours` | integer | No* | Número de horas hábiles a sumar |
| `date` | string | No | Fecha inicial en formato UTC ISO 8601 con sufijo Z |

*Al menos uno de `days` o `hours` debe ser proporcionado.

### Ejemplos de Uso

#### 1. Sumar 1 hora desde ahora
```bash
curl "https://tu-api.com/?hours=1"
```

#### 2. Sumar 2 días desde ahora
```bash
curl "https://tu-api.com/?days=2"
```

#### 3. Sumar 1 día y 3 horas desde una fecha específica
```bash
curl "https://tu-api.com/?days=1&hours=3&date=2025-04-10T15:00:00.000Z"
```

### Respuestas

#### Éxito (200 OK)
```json
{
  "date": "2025-08-01T14:00:00Z"
}
```

#### Error (400 Bad Request)
```json
{
  "error": "InvalidParameters",
  "message": "Al menos uno de los parámetros \"days\" o \"hours\" debe ser proporcionado"
}
```

## 🧠 Lógica de Negocio

### Horario Laboral
- **Días:** Lunes a Viernes
- **Horas:** 8:00 AM - 5:00 PM (hora de Colombia)
- **Almuerzo:** 12:00 PM - 1:00 PM (no laboral)

### Ajuste de Fechas
Si la fecha inicial está fuera del horario laboral:
- Se ajusta hacia atrás al momento laboral más cercano
- Fines de semana → último viernes a las 4:00 PM
- Después de 5:00 PM → mismo día a las 4:00 PM
- Antes de 8:00 AM → día anterior a las 4:00 PM
- Durante almuerzo → 11:59 AM del mismo día

### Festivos
Los días festivos colombianos se obtienen dinámicamente desde:
```
https://content.capta.co/Recruitment/WorkingDays.json
```

## 📁 Estructura del Proyecto

```
src/
├── types.ts                 # Definiciones de tipos TypeScript
├── index.ts                 # Punto de entrada y configuración del servidor
├── utils/
│   ├── dateUtils.ts         # Utilidades para manejo de fechas
│   └── validator.ts         # Validación de parámetros
└── services/
    ├── holidayService.ts    # Servicio para obtener festivos
    └── workingDaysService.ts # Lógica principal de cálculo
```

## 🧪 Testing

Para ejecutar las pruebas:
```bash
npm test
```

## 🚀 Despliegue

### Variables de Entorno
- `PORT`: Puerto del servidor (por defecto: 3000)

### Plataformas Compatibles
- ✅ Vercel
- ✅ Railway
- ✅ Render
- ✅ AWS Lambda (con adaptaciones)
- ✅ Heroku
- ✅ Google Cloud Run

### Ejemplo para Vercel
1. Crear archivo `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

2. Desplegar:
```bash
vercel --prod
```

## 📊 Ejemplos de Casos de Uso

### Caso 1: Viernes 5:00 PM + 1 hora
**Input:** `?hours=1` (viernes 17:00)  
**Output:** Lunes 9:00 AM → `"2025-XX-XXT14:00:00Z"`

### Caso 2: Sábado 2:00 PM + 1 hora  
**Input:** `?hours=1` (sábado 14:00)  
**Output:** Lunes 9:00 AM → `"2025-XX-XXT14:00:00Z"`

### Caso 3: Martes 3:00 PM + 1 día + 3 horas
**Input:** `?days=1&hours=3` (martes 15:00)  
**Output:** Jueves 10:00 AM → `"2025-XX-XXT15:00:00Z"`

## 🛡️ Validaciones

- ✅ Parámetros numéricos positivos
- ✅ Formato de fecha ISO 8601 con sufijo Z
- ✅ Al menos un parámetro requerido (days o hours)
- ✅ Manejo de errores HTTP apropiados

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Modo desarrollo con hot-reload
npm run build    # Compilar TypeScript
npm start        # Ejecutar versión compilada
npm test         # Ejecutar pruebas
```

### Tecnologías
- **TypeScript** - Lenguaje principal
- **Express.js** - Framework web
- **CORS** - Manejo de políticas de origen cruzado

## 📝 Notas Técnicas

- La API maneja automáticamente la conversión entre UTC y hora de Colombia
- Los cálculos se realizan siempre en hora local colombiana
- La respuesta final siempre está en UTC
- Los festivos se cachean en memoria para optimizar rendimiento
- Manejo robusto de errores con códigos HTTP apropiados

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades, crear un issue en el repositorio.

---

**Desarrollado con ❤️ en TypeScript para el manejo preciso de fechas hábiles en Colombia.**