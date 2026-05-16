# Cheema Family Hub — Beta / Staging

This is the staging copy of the live app at
`github.com/J-C-81/cheema-family-hub`. It is fully isolated from the
family-facing app so changes can be tested here first.

- **Beta URL:** https://j-c-81.github.io/cheema-family-hub-beta/
- **Live URL:** https://j-c-81.github.io/cheema-family-hub/

## What's isolated

| Resource         | Live                              | Beta                                   |
| ---              | ---                               | ---                                    |
| Firebase data    | `/cheema.json`                    | `/cheema-beta.json`                    |
| Push subs        | `/subscriptions`                  | `/subscriptions-beta`                  |
| Push worker      | `cfh-push.…workers.dev`           | `cfh-push-beta.…workers.dev`           |
| VAPID keys       | (prod set)                        | independent beta set                   |
| PWA scope        | `/cheema-family-hub/`             | `/cheema-family-hub-beta/`             |
| Manifest name    | "Cheema Family Hub"               | "Cheema Family Hub (Beta)"             |
| iOS home icon    | "Family Hub"                      | "Hub Beta"                             |
| Theme color      | lavender `#eef2ff`                | amber `#fef3c7`                        |
| UI marker        | —                                 | small amber `BETA` pill in the footer  |

No code path in beta touches any live Firebase key. No deploy here can
reach a family device — the beta worker only reads
`/subscriptions-beta`, which is populated exclusively by installs of
the beta PWA.

## Promotion

Done via `~/work/promote-beta-to-main.sh`. The script copies
`index.html` from this repo into the live repo, strips beta-only
values back to their prod equivalents (BETA flag, FB path, worker URL,
sub path, SW scope, manifest, title, theme color, the BETA pill),
shows a diff, then commits and pushes to `main` after confirmation.
