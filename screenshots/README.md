# UI screenshots (AI visual review)

This folder holds **latest UI captures** for Cursor / Claude agents to inspect after frontend changes.

## Capture

```bash
# Terminal 1 — dev server
npm run dev

# Terminal 2 — screenshots (or let the agent run this)
npm run screenshots
```

Fully autonomous (starts dev server, captures, stops server):

```bash
npm run screenshots:serve
```

Wait until an existing server is up:

```bash
npm run screenshots:wait
```

Output lands in `screenshots/latest/`:

| File                    | Page                        |
| ----------------------- | --------------------------- |
| `landing-mobile.png`    | `/en` @ 390×844             |
| `landing-desktop.png`   | `/en` @ 1280×800            |
| `login-mobile.png`      | `/en/login` @ 390×844       |
| `login-desktop.png`     | `/en/login` @ 1280×800      |
| `landing-mobile-fr.png` | `/fr` @ 390×844             |
| `manifest.json`         | metadata + paths for agents |

## Agent workflow

After editing landing/auth UI:

1. Run `npm run screenshots` (or `--serve` if dev isn't running).
2. **Read** `screenshots/latest/*.png` with the vision-capable Read tool.
3. Check centering, spacing, contrast, mobile layout, broken overflow.
4. Fix code and repeat until it looks right.

First-time setup (Chromium for Playwright):

```bash
npm run playwright:install
```
