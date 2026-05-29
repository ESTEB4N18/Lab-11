# DevOps CI/CD - BovWeight CR

## Alcance del analisis

Este checkout contiene el frontend `bovweight-app` de BovWeight CR, construido con Ionic, Vue 3, Vite y Node.js. En esta carpeta no existen `composer.json`, `artisan`, `phpunit.xml`, `requirements.txt`, `pyproject.toml` ni una aplicacion Flask.

Por esa razon, `.github/workflows/ci.yml` quedo preparado para ambos escenarios:

- En este repo Ionic/Vue ejecuta `app-ci` con Node.js 20, `npm ci`, `npm run lint` y `npm run build`.
- En `bovweight-api` ejecuta `laravel-tests` con PHP 8.2, Composer, MySQL, migraciones y PHPUnit.

Comandos detectados en el repo actual:

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

Resultado local al analizar este checkout:

- `npm run lint` pasa correctamente.
- Antes de refrescar dependencias, `npm run build` fallaba porque el `node_modules` local no tenia disponible `@supabase/supabase-js`.
- Despues de ejecutar `npm ci`, `npm run build` pasa correctamente, con advertencias de chunks grandes de Vite/Rollup.
- `npm ci` reporta 10 vulnerabilidades npm audit: 4 moderadas y 6 altas.

## Estructura agregada

```text
.github/
  workflows/
    ci.yml
docs/
  devops-ci-cd.md
scripts/
  configure-branch-protection.ps1
README.md
```

## Pipeline CI

El workflow `CI - BovWeight CR` se ejecuta en:

- `push` a `main`
- `push` a `develop`
- `push` a `feature/**`
- `push` a `hotfix/**`
- `pull_request` hacia `main`
- `pull_request` hacia `develop`

La rama `feature/**` se incluye porque la estrategia del laboratorio exige CI en cada push de feature. `pull_request` hacia `develop` se incluye para validar merges normales de features.

Jobs del workflow:

1. `detect-project`: detecta si el repositorio contiene Laravel (`composer.json` + `artisan`) o Node (`package.json` + `package-lock.json`).
2. `app-ci`: corre solo para Ionic/Vue. Instala Node.js 20, restaura cache npm, instala dependencias, ejecuta lint y genera build de produccion.
3. `laravel-tests`: corre solo para Laravel. Levanta MySQL, prepara `.env`, ejecuta migraciones y PHPUnit.

Steps principales de `laravel-tests`:

1. `Checkout repository`: descarga el codigo fuente en el runner.
2. `Validate Laravel project structure`: exige `composer.json`, `artisan` y `phpunit.xml` o `phpunit.xml.dist`; si no estan, el CI falla con una causa clara.
3. `Setup PHP 8.2`: instala PHP 8.2, Composer v2 y extensiones comunes para Laravel con MySQL.
4. `Get Composer cache directory`: obtiene la ruta real de cache de Composer.
5. `Cache Composer downloads`: reutiliza descargas de Composer con `actions/cache@v4`.
6. `Install PHP dependencies`: ejecuta `composer install`.
7. `Prepare Laravel environment`: crea `.env` desde `.env.example` si existe y fuerza variables de prueba.
8. `Validate MySQL connection`: confirma que MySQL este listo antes de migrar.
9. `Clear and cache Laravel configuration`: limpia cache previa y genera `config:cache` con variables de CI.
10. `Run database migrations`: ejecuta `php artisan migrate --force`.
11. `Run PHPUnit test suite`: usa `composer test` si existe; si no, `vendor/bin/phpunit`; como fallback, `php artisan test`.

Status checks recomendados:

- Para `bovweight-api`: `laravel-tests`.
- Para este repo Ionic/Vue: `app-ci`.

## Variables de entorno usadas en CI

```env
APP_ENV=testing
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bovweight_test
DB_USERNAME=bovweight
DB_PASSWORD=secret
CACHE_DRIVER=array
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync
MAIL_MAILER=array
BCRYPT_ROUNDS=4
```

## Por que MySQL y no SQLite

Se usa MySQL porque el laboratorio lo exige y porque una API Laravel real suele depender de comportamiento especifico del motor usado en produccion: tipos numericos, constraints, indices, claves foraneas, collation, timestamps, JSON, transacciones y diferencias de SQL. SQLite es rapido para pruebas unitarias, pero puede ocultar errores de migraciones o queries que si fallarian en MySQL.

## Como ejecutarlo localmente en `bovweight-api`

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configurar `.env` local:

```env
APP_ENV=testing
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bovweight_test
DB_USERNAME=bovweight
DB_PASSWORD=secret
CACHE_DRIVER=array
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync
MAIL_MAILER=array
```

Ejecutar base de datos local:

```bash
docker run --name bovweight-mysql-test -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=bovweight_test -e MYSQL_USER=bovweight -e MYSQL_PASSWORD=secret -p 3306:3306 -d mysql:8.4
```

Ejecutar migraciones y pruebas:

```bash
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
vendor/bin/phpunit
```

Si el proyecto define script `test` en `composer.json`, usar:

```bash
composer test
```

## Como probar fallos del pipeline

- Crear una prueba PHPUnit que haga `self::assertTrue(false);`.
- Crear una migracion invalida temporalmente.
- Cambiar `DB_DATABASE` por una base inexistente sin permisos.
- El resultado esperado es que el job `laravel-tests` quede en rojo y el PR no pueda fusionarse si el status check es obligatorio.

## Cuellos de botella

- Descarga de dependencias Composer cuando no existe cache.
- Arranque y health check de MySQL.
- Migraciones completas en cada corrida.
- Tests de integracion que golpean base de datos sin transacciones o factories eficientes.
- `config:cache` puede causar confusion si una prueba modifica variables en runtime.

## Mejoras sugeridas

- Dividir jobs: lint/static analysis, tests unitarios y tests de integracion.
- Agregar Pint/PHPStan/Psalm si el API ya los usa.
- Usar matriz para PHP 8.2 y 8.3 cuando el proyecto madure.
- Publicar cobertura como artifact o integrarla con Codecov.
- Agregar tests unitarios al `bovweight-app` para que el CI valide comportamiento, no solo lint/build.
- Agregar CI propio para `bovweight-ml` con Python 3.11, entorno virtual, dependencias y `pytest`.

## Estrategia de ramas

`main`:

- Rama estable y protegida.
- Solo recibe PR.
- Requiere CI exitoso.
- Requiere minimo 1 reviewer.
- Force push deshabilitado.

`develop`:

- Rama de integracion.
- Requiere CI exitoso.
- Recibe PR desde `feature/**`.
- Merge recomendado: squash merge.

`feature/**`:

- Nacen desde `develop`.
- Ejecutan CI en cada push.
- Solo deben abrir PR hacia `develop`.

`hotfix/**`:

- Nacen desde `main`.
- Abren PR hacia `main`.
- Luego el mismo cambio debe regresar a `develop` mediante PR o cherry-pick.

## Branch protection exacto en GitHub

Ir a `Settings > Branches > Add branch protection rule`.

Regla para `main`:

- Branch name pattern: `main`
- Activar `Require a pull request before merging`
- Activar `Require approvals` y colocar `1`
- Activar `Require status checks to pass before merging`
- Activar `Require branches to be up to date before merging`
- Agregar status check obligatorio: `laravel-tests` en `bovweight-api` o `app-ci` en este repo
- Activar `Do not allow bypassing the above settings`
- Dejar desactivado `Allow force pushes`
- Dejar desactivado `Allow deletions`

Regla para `develop`:

- Branch name pattern: `develop`
- Activar `Require a pull request before merging`
- Activar `Require status checks to pass before merging`
- Activar `Require branches to be up to date before merging`
- Agregar status check obligatorio: `laravel-tests` en `bovweight-api` o `app-ci` en este repo
- Activar `Do not allow bypassing the above settings`
- Dejar desactivado `Allow force pushes`
- Dejar desactivado `Allow deletions`

Para bloquear merges sin CI exitoso, el punto critico es que el job correcto (`laravel-tests` o `app-ci`) este seleccionado en `Require status checks to pass before merging`.

Para squash merge en `develop`, ir a `Settings > General > Pull Requests`:

- Activar `Allow squash merging`
- Desactivar `Allow merge commits` y `Allow rebase merging` si se desea forzar squash en todo el repositorio.

GitHub classic branch protection no permite restringir por si sola que una rama fuente `feature/**` solo apunte a `develop`. Esa regla se controla con convencion de equipo, revision obligatoria, CODEOWNERS o GitHub Rulesets avanzados.

## Verificacion de branch protection

1. Abrir un PR hacia `main` con una prueba fallida.
2. Confirmar que `laravel-tests` aparece fallido.
3. Confirmar que el boton de merge queda bloqueado.
4. Corregir la prueba y pushear.
5. Confirmar que el PR sigue bloqueado hasta tener CI exitoso y 1 aprobacion.
6. Intentar push directo a `main`; debe ser rechazado.
7. Intentar force push a `main`; debe ser rechazado.

## Configuracion automatizada con script

El archivo `scripts/configure-branch-protection.ps1` configura `main` y `develop` usando la API de GitHub. Tambien crea `develop` desde `main` si todavia no existe.

Requiere un token con permisos de administracion del repositorio. No se debe commitear el token.

Para este repo Ionic/Vue:

```powershell
$env:GH_ADMIN_TOKEN = "TOKEN_CON_PERMISOS_ADMIN"
.\scripts\configure-branch-protection.ps1 `
  -Owner "ESTEB4N18" `
  -Repo "Lab-11" `
  -Token $env:GH_ADMIN_TOKEN `
  -MainStatusCheck "app-ci" `
  -DevelopStatusCheck "app-ci"
```

Para `bovweight-api`:

```powershell
$env:GH_ADMIN_TOKEN = "TOKEN_CON_PERMISOS_ADMIN"
.\scripts\configure-branch-protection.ps1 `
  -Owner "OWNER" `
  -Repo "bovweight-api" `
  -Token $env:GH_ADMIN_TOKEN `
  -MainStatusCheck "laravel-tests" `
  -DevelopStatusCheck "laravel-tests"
```

## Comandos GitHub CLI opcionales

Reemplazar `OWNER` y `REPO` antes de ejecutar:

```bash
gh api repos/OWNER/REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=app-ci \
  --field enforce_admins=true \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

gh api repos/OWNER/REPO/branches/develop/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=app-ci \
  --field enforce_admins=true \
  --field required_pull_request_reviews[required_approving_review_count]=0 \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Compatibilidad

El workflow usa `ubuntu-latest`, service containers de GitHub Actions, `actions/checkout@v4`, `actions/cache@v4` y `shivammathur/setup-php@v2`, todos compatibles con flujos modernos de GitHub Actions. Los service containers requieren runners Linux, por eso el job usa Ubuntu.
