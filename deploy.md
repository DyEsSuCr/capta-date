# Guía de Despliegue y Testing

## 🚀 Despliegue

### Railway

1. **Conectar repositorio a Railway:**
   - Ir a [railway.app](https://railway.app)
   - Conectar con GitHub
   - Seleccionar el repositorio

2. **Configurar variables de entorno:**
   - `PORT` → `$PORT` (Railway lo asigna automáticamente)

## 🧪 Testing Completo

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests con coverage
npm test -- --coverage

# Tests en modo watch
npm test -- --watch

# Test específico
npm test -- dateUtils.test.ts
```

### Tests de Integración Manual

#### 1. Test básico de funcionamiento
```bash
curl "http://localhost:3000/?hours=1"
```

#### 2. Test con días y horas
```bash
curl "http://localhost:3000/?days=1&hours=3"
```

#### 3. Test con fecha específica
```bash
curl "http://localhost:3000/?days=5&hours=4&date=2025-04-10T15:00:00.000Z"
```

#### 4. Test de validación de errores
```bash
# Sin parámetros
curl "http://localhost:3000/"

# Parámetro inválido
curl "http://localhost:3000/?days=abc"

# Fecha sin Z
curl "http://localhost:3000/?days=1&date=2025-04-10T15:00:00.000"
```

## 🔍 Testing de Casos Específicos

### Script de Testing Automático
```bash
#!/bin/bash
# test-cases.sh

API_URL="https://tu-api-desplegada.vercel.app"

echo "Testing Case 1: Friday 5PM + 1 hour"
curl -s "$API_URL/?hours=1&date=2025-01-17T22:00:00.000Z" | jq

echo -e "\nTesting Case 2: Saturday 2PM + 1 hour"
curl -s "$API_URL/?hours=1&date=2025-01-18T19:00:00.000Z" | jq

echo -e "\nTesting Case 3: Tuesday 3PM + 1 day + 3 hours"
curl -s "$API_URL/?days=1&hours=3&date=2025-01-14T20:00:00.000Z" | jq

echo -e "\nTesting Case 4: Sunday 6PM + 1 day"
curl -s "$API_URL/?days=1&date=2025-01-19T23:00:00.000Z" | jq

echo -e "\nTesting Case 5: Workday 8AM + 8 hours"
curl -s "$API_URL/?hours=8&date=2025-01-13T13:00:00.000Z" | jq

echo -e "\nTesting Case 6: Workday 8AM + 1 day"
curl -s "$API_URL/?days=1&date=2025-01-13T13:00:00.000Z" | jq

echo -e "\nTesting Case 7: Workday 12:30PM + 1 day"
curl -s "$API_URL/?days=1&date=2025-01-13T17:30:00.000Z" | jq

echo -e "\nTesting Case 8: Workday 11:30AM + 3 hours"
curl -s "$API_URL/?hours=3&date=2025-01-13T16:30:00.000Z" | jq

echo -e "\nTesting Case 9: Holiday scenario"
curl -s "$API_URL/?days=5&hours=4&date=2025-04-10T20:00:00.000Z" | jq
```

### Hacer ejecutable y correr:
```bash
chmod +x test-cases.sh
./test-cases.sh
```

## 📊 Validación de Respuestas Esperadas

### Caso 1: Viernes 5PM + 1 hora
- **Input:** `?hours=1&date=2025-01-17T22:00:00.000Z` (Viernes 5PM Colombia)
- **Expected:** Lunes 9:00 AM Colombia → `"2025-01-20T14:00:00.000Z"`

### Caso 2: Sábado 2PM + 1 hora  
- **Input:** `?hours=1&date=2025-01-18T19:00:00.000Z` (Sábado 2PM Colombia)
- **Expected:** Lunes 9:00 AM Colombia → `"2025-01-20T14:00:00.000Z"`

### Caso 3: Martes 3PM + 1 día + 3 horas
- **Input:** `?days=1&hours=3&date=2025-01-14T20:00:00.000Z` (Martes 3PM Colombia)  
- **Expected:** Jueves 10:00 AM Colombia → `"2025-01-16T15:00:00.000Z"`

## 🛠️ Herramientas de Desarrollo

### Configuración de VSCode
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "typescript.format.enable": true
}
```

### Configuración de ESLint (opcional)
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## 📈 Monitoreo y Logs

### Logs de Producción
```typescript
// src/utils/logger.ts
export class Logger {
  static info(message: string, meta?: any): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }

  static warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
  }
}
```

### Health Check Endpoint
```typescript
// Agregar al index.ts
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔄 CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## ⚡ Optimizaciones de Performance

### Caché de Festivos
```typescript
// Implementar caché con TTL
class CacheManager {
  private static cache = new Map<string, { data: any; expiry: number }>();

  static set(key: string, data: any, ttlMs: number = 3600000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  static get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
}
```

### Compresión HTTP
```typescript
import compression from 'compression';
app.use(compression());
```

## 📋 Checklist Final

- [ ] ✅ Código compilado sin errores TypeScript
- [ ] ✅ Tests pasando (mínimo 80% coverage)  
- [ ] ✅ API desplegada y accesible públicamente
- [ ] ✅ Validación de todos los casos de ejemplo
- [ ] ✅ Manejo correcto de errores HTTP
- [ ] ✅ Respuestas en formato exacto especificado
- [ ] ✅ README con instrucciones claras
- [ ] ✅ Repositorio público en GitHub
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Logs de depuración implementados

---

**¡Tu API está lista para producción! 🚀**