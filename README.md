# Controlla ortografica rumantscha: Add-in Microsoft Office

A Romansh spellchecker add-in for Microsoft Word. This add-in integrates with Microsoft Word to provide real-time spellchecking for the Romansh language.

## Features

- Spellchecking for all six Romansh idioms:
  - Rumantsch Grischun
  - Sursilvan
  - Sutsilvan
  - Surmiran
  - Puter
  - Vallader
- Inline error highlighting (on supported Word versions with API level 1.8+)
- Fallback legacy view for older Word versions
- Custom ignored words list
- Works in Word desktop (Windows/macOS) and Word Online

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [pnpm](https://pnpm.io/) package manager
- Microsoft Word (desktop or web)
- For desktop development on macOS/Windows: Word must be installed locally
- Enable dev mode if you want to debug the software: https://learn.microsoft.com/en-us/office/dev/add-ins/testing/debug-office-add-ins-on-ipad-and-mac

## Getting started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Generate SSL certificates for local development:
   ```bash
   pnpm run ssl:config
   ```
   Note: Certificates expire after 30 days. Re-run this command to regenerate them.

3. Start the development server and Word:
   ```bash
   # start dev server
   pnpm run dev-server
   
   # For desktop Word
   pnpm run start:desktop

   # For Word Online (requires a document URL)
   pnpm run start:web -- --document https://your-document-url
   ```

Sideloading in web: https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing#manually-sideload-an-add-in-to-office-on-the-web

If Word Online doesn't load the add-in on the first try, visit https://localhost:4200 first to trust the self-signed certificate.

## Available scripts

| Script                      | Description                                        |
|-----------------------------|----------------------------------------------------|
| `pnpm run dev-server`       | Start the development server only                  |
| `pnpm run start:desktop`    | Start dev server and open Word desktop with add-in |
| `pnpm run start:web`        | Start dev server and open Word Online with add-in  |
| `pnpm run build:dev`        | Development build (output in `dist/`)              |
| `pnpm run build:staging`    | Staging build (output in `dist/`)                  |
| `pnpm run build`            | Production build (output in `dist/`)               |
| `pnpm run lint`             | Lint the codebase                                  |
| `pnpm run validate`         | Validate the dev Office add-in manifest            |
| `pnpm run validate:staging` | Validate the stagin Office add-in manifest         |
| `pnpm run validate:prod`    | Validate the prod Office add-in manifest           |

## Debugging

- **Word Online**: Use your browser's developer tools (F12)
- **Word Desktop (Windows)**: Use F12 developer tools or attach a debugger from the task pane
- **Word Desktop (macOS)**: Use Safari Web Inspector

For detailed debugging instructions, see the [Office Add-ins debugging documentation](https://learn.microsoft.com/office/dev/add-ins/testing/debug-add-ins-overview).

## Project structure

```
src/
├── app/
│   ├── spellchecker-inline/  # Modern inline spellchecker (Word API 1.8+)
│   ├── spellchecker-legacy/  # Fallback for older Word versions
│   ├── settings/             # User settings component
│   ├── ignored-words/        # Custom ignored words management
│   ├── services/             # Spellchecking and API services
│   └── data/                 # Data types and constants
├── assets/                   # Icons and static assets
├── manifest.xml              # Development manifest
├── manifest-staging.xml      # Staging manifest
└── manifest-prod.xml         # Production manifest
```

## Release process

Deployment is fully automated via GitHub Actions — there is no manual build/upload step. The workflows live in `.github/workflows/`.

| Branch    | Workflow             | Build command        | Deploys to |
|-----------|----------------------|----------------------|------------|
| `staging` | `deploy-staging.yml` | `pnpm build:staging` | Staging    |
| `main`    | `deploy-prod.yml`    | `pnpm build`         | Production |

To ship a change:

1. Merge/push to `staging` to deploy to the staging environment.
2. Once verified on staging, merge `staging` into `main` (or open a PR and merge it) to deploy to production.

Each deploy job builds the app, then uploads `dist/addin` over FTP, first moving the currently-live `addin` folder into a timestamped `_backups/<timestamp>/` directory on the server. Both workflows can also be triggered manually from the Actions tab via "Run workflow" (`workflow_dispatch`) without needing a new commit.

`scripts/generate-version.js` bakes the current `version` field from `package.json` (plus the short git hash) into the build. Bump `"version"` in `package.json` before releasing if you want the deployed build to reflect a new version number — nothing does this automatically.

### Rolling back

Use the "Restore from Backup" workflow (`restore.yml`) from the Actions tab: pick the `staging` or `production` environment and provide the backup timestamp to restore (format `YYYY-MM-DD_HH-MM-SS`, visible in the deploy job logs or by listing `_backups/` on the FTP server). The currently-live version is itself backed up as `_backups/pre-restore_<timestamp>/` before the restore happens, so a bad restore can also be undone.

## Resources

- [Pledari Grond](https://www.pledarigrond.ch) - Romansh online dictionary
- [Office Add-ins documentation](https://learn.microsoft.com/office/dev/add-ins/overview/office-add-ins)
- [Angular documentation](https://angular.dev)

## License

MIT
