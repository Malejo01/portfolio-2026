# Portfolio — Mauro Lizárraga

[malejo.com.ar](https://malejo.com.ar)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion.

## Correr en local

```bash
npm install
npm run dev
```

## Arquitectura

```
app/
├── layout.tsx              root: fuentes, script de boot (tema + marca `js`), ThemeProvider
├── globals.css             tokens de diseño, @theme de Tailwind, failsafe sin JS
├── opengraph-image.tsx     OG 1200×630 generada con ImageResponse
├── sitemap.ts · robots.ts
└── (marketing)/
    ├── layout.tsx          Navbar + Footer + contenedor
    ├── page.tsx            landing
    └── casos/
        ├── que-pinta-salta/page.tsx
        └── maestria/page.tsx

components/
├── ThemeProvider.tsx       "use client" — único dueño de la clase `dark`
├── motion/Reveal.tsx       "use client" — wrapper de entrada (fadeUp / stagger)
├── case-study/             ArchitectureDiagram (SVG animado), CaseHeader
├── layout/                 Navbar, Footer
├── sections/               las 6 secciones de la landing
└── ui/                     Aside, ButtonLink, Chip, Container, SectionLabel, toggles

lib/
├── content/{es,en}.ts      diccionario tipado `Record<Locale, Content>`
├── types.ts · locale.ts · links.ts · motion.ts
proxy.ts                    negociación de idioma en la primera visita
```

Todo es Server Component salvo cinco archivos: `ThemeProvider`, `Reveal`,
`ArchitectureDiagram`, `ThemeToggle` y `LocaleToggle`. El contenido nunca
entra al bundle del cliente — llega como `children` a los wrappers.

## Sistema de diseño

Los tokens viven en `app/globals.css` (`:root` y `.dark`) y se exponen a
Tailwind con `@theme inline`. La jerarquía se construye con superficie
(`paper` / `paper-2` / `panel`) y hairlines de 0.5px: **no hay una sola
`box-shadow` en el sitio**. El acento verde aparece en exactamente dos
situaciones — "acá interviene el modelo" y "acá está la acción principal".

Escala tipográfica de razón 1.25 sobre base 17px. Bricolage Grotesque
(variable, eje `opsz`) para display, Public Sans para cuerpo, JetBrains Mono
para labels y metadatos.

## Idioma y tema

Ambos viven en una cookie que leen los Server Components; no hay routing por
locale ni copy duplicada en el cliente. `proxy.ts` persiste la negociación
del navegador en la primera visita; los toggles del nav la sobrescriben.

El tema se aplica antes del primer paint con un script inline en `<head>`,
así que no hay flash. La fuente de verdad es la clase `dark` en `<html>` y
`ThemeProvider` la lee con `useSyncExternalStore`.

## Animación

Framer Motion, con dos reglas: `whileInView` con `once: true`, y
`useReducedMotion()` saltando al estado final. Un solo momento orquestado —
el diagrama de arquitectura del caso Qué Pinta Salta.

El estado inicial (`opacity: 0`) se serializa en el HTML del servidor, así
que `globals.css` incluye un failsafe: si el script de boot no llegó a
agregar `.js` a `<html>` —JS desactivado o bloqueado— todo vuelve a su
estado final y la página se lee igual, sin animación.

## Pendiente de completar

`lib/links.ts` centraliza los enlaces externos. Los que están en `""` no se
renderizan (mejor que un `href="#"` que se puede tabular y no lleva a lado
alguno):

- `qps.interview` — entrevista en El Diez TV
- `maestria.repo` — repo de MaestrIA
- `cv` — apunta a `/mauro-lizarraga-cv.pdf`, hay que subir el archivo a `public/`
