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

Nota: este checkout corresponde al app Ionic/Vue. El workflow `.github/workflows/ci.yml` esta preparado para el repositorio `bovweight-api` de Laravel y valida al inicio que existan `composer.json`, `artisan` y PHPUnit.
