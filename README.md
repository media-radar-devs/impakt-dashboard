This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Integración con Telegram

El dashboard incluye una página de Integraciones para que usuarios autenticados conecten o reconecten Telegram. El flujo principal llama desde el navegador a `POST /api/proxy/auth/telegram-link-url` sin body; el proxy del dashboard lee la cookie `impakt_session` y adjunta el `Authorization: Bearer <token>` hacia el backend. El backend responde con una URL temporal de Telegram y el dashboard la abre con `window.location.href`.

La URL y cualquier token incluido en ella se usan únicamente para redirigir a Telegram: el dashboard no los guarda en `localStorage`, `sessionStorage`, cookies ni otro almacenamiento persistente. Como fallback, la misma tarjeta permite generar un PIN mediante `POST /api/proxy/auth/request-link-code` con `{ "channel_type": "telegram" }` para enviarlo manualmente al bot.

Actualmente el backend no expone `telegram_linked`, por lo que la UI no muestra un estado definitivo de “Telegram conectado” ni oculta las acciones si el usuario ya vinculó su cuenta.
