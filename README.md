# BovWeight CR

Repositorio del frontend BovWeight CR basado en Ionic, Vue 3 y Vite.

## Comandos locales detectados

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

## DevOps CI/CD

La implementacion del laboratorio DevOps esta documentada en:

- [docs/devops-ci-cd.md](docs/devops-ci-cd.md)

El workflow Laravel solicitado se encuentra en:

- [.github/workflows/ci.yml](.github/workflows/ci.yml)

El workflow tambien ejecuta CI real para este repo Ionic/Vue mediante el job `app-ci`.

Para configurar branch protection por API:

- [scripts/configure-branch-protection.ps1](scripts/configure-branch-protection.ps1)

## Respuestas del laboratorio

### 1. Tiempo del pipeline y step mas lento

El pipeline exitoso ejecutado en `main` el 29 de mayo de 2026 tardo aproximadamente **1 minuto 51 segundos** en completarse.

Referencia del run:

- Workflow: `CI - BovWeight CR`
- Run: `26649234557`
- Inicio: `11:24 a.m`
- Fin: `11:26 a.m` 

El job principal del frontend, `app-ci`, tardo **1 minuto 35 segundos**. El step mas lento fue:

- `Install Node dependencies`: aproximadamente **59 segundos**

El segundo step mas costoso fue:

- `Build Ionic Vue app`: aproximadamente **20 segundos**

### 2. Que ocurre si falla una prueba o validacion en un pull request

Si una prueba o validacion falla, GitHub Actions marca el check obligatorio como fallido. Como `app-ci` esta configurado como status check requerido en Branch Protection, el pull request queda bloqueado y no se puede hacer merge hasta corregir el error y volver a ejecutar el pipeline exitosamente.

Se probo con el PR `#2`, desde `feature/test-protection` hacia `develop`. El resultado fue:

- `mergeStateStatus`: `BLOCKED`
- `app-ci`: `FAILURE`
- Motivo: fallo intencional de lint por una variable no usada.

Captura de evidencia:

- [docs/evidence/pr-2-branch-protection.png](docs/evidence/pr-2-branch-protection.png)

PR de evidencia:

- <https://github.com/ESTEB4N18/Lab-11/pull/2>

### 3. Por que usar MySQL en lugar de SQLite para las pruebas

Se usa MySQL porque BovWeight CR debe validar el comportamiento del sistema con un motor equivalente al entorno real del API. Aunque SQLite es mas liviano y rapido, puede ocultar diferencias importantes en:

- Llaves foraneas y restricciones relacionales.
- Tipos de datos numericos, fechas y campos JSON.
- Indices, collation y ordenamientos.
- Transacciones y comportamiento concurrente.
- Compatibilidad real de migraciones Laravel.

Para los requisitos no funcionales de BovWeight CR, especialmente confiabilidad, integridad de datos y comportamiento consistente del backend, es mas seguro ejecutar las pruebas contra MySQL. Esto reduce el riesgo de que una migracion o query pase en SQLite pero falle luego en produccion o en un ambiente similar al productivo.

### 4. Ventaja de usar `actions/checkout@v4`

`actions/checkout@v4` es preferible a clonar manualmente porque integra el checkout con el contexto de GitHub Actions. Sus ventajas principales son:

- Usa automaticamente el commit exacto que disparo el workflow.
- Maneja autenticacion con `GITHUB_TOKEN` sin exponer credenciales manuales.
- Funciona correctamente para eventos `push` y `pull_request`.
- Reduce comandos personalizados y posibles errores de clone/fetch.
- Es una action mantenida oficialmente y compatible con buenas practicas de CI.

Clonar manualmente agregaria complejidad innecesaria y podria traer una rama o commit equivocado si no se configura con mucho cuidado. 
