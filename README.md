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
