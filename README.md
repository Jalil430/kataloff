# Kataloff

Static React/Vite site prepared for GitHub Pages.

## Deploy to GitHub Pages

The repository is configured for GitHub Pages source:

- Branch: `main`
- Folder: `/docs`

To rebuild the deployable files:

```sh
cd frontend
npm install
npm run build:pages
```

Commit and push the generated `docs/` folder.

## Runtime Notes

- The calculator runs fully in the browser and does not require the Go backend.
- `VITE_WHATSAPP_NUMBER` is optional; if omitted, the frontend uses `79380000599`.
- The installment lookup page calls the FinPay API directly from the browser. Any `VITE_FINPAY_LOOKUP_TOKEN` used for a GitHub Pages build is public in the generated JavaScript. Keep it blank unless that token is meant to be public.

Local environment files such as `.env` are ignored by git. Use the checked-in `.env.example` files as templates.
