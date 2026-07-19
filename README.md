# Crispy Keys

App de piano virtual (projeto `piano-app`) com reprodução MIDI, gravação, campos harmônicos e figuras rítmicas.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

O deploy é automático via GitHub Actions em cada push na `main`.

URL publicada: https://breno-abreu.github.io/piano-app/

### Ativar Pages (uma vez)

1. No repositório: **Settings → Pages**
2. Em **Build and deployment → Source**, escolha **GitHub Actions**
3. Faça push na `main` (ou rode o workflow **Deploy to GitHub Pages** manualmente)

O `npm run build:pages` usa `base: '/piano-app/'` para os assets carregarem corretamente no subpath do Pages.
