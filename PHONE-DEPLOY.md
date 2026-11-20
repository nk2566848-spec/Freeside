# Freeside — phone-only deployment

This project is a React + Vite + TanStack Start server-rendered web app. It must be deployed as a server application (for example, to Vercel); it is not a self-contained static site. The Android wrapper/TWA is a later step after HTTPS deployment.

## Deploy from an Android phone

1. Download this ZIP to your phone.
2. In Chrome, sign in to GitHub and create a repository named `freeside`.
3. Upload this ZIP as a repository file (for example `Freeside-Android-phone-build.zip`).
4. Open the repository's **Code → Codespaces → Create codespace on main**. If Codespaces is unavailable, use a cloud development environment that provides a Linux terminal and Node.js 22.
5. In the Codespaces terminal, run:

   ```sh
   unzip Freeside-Android-phone-build.zip -d /tmp/freeside-src
   cp -a /tmp/freeside-src/. .
   rm Freeside-Android-phone-build.zip
   npm ci
   npm run build
   ```

6. If the build succeeds, commit and push the extracted project:

   ```sh
   git add -A
   git commit -m "Add Freeside application"
   git push
   ```

7. Open Vercel in Chrome, sign in with GitHub, choose **Add New → Project**, import `freeside`, and deploy. Keep the detected framework/build settings. The repository's `vercel.json` defines the install command. If Vercel reports a missing environment variable, do not guess a value; inspect the error and configure only the required variable.
8. Open the deployed HTTPS URL on your phone and check that the app loads and its main features work.

## Android packaging

After the website is live, use PWABuilder to inspect the deployed URL and package it for Android. The manifest is served dynamically at `/__grok/manifest.webmanifest` and now declares 180, 192, and 512 pixel icons. PWABuilder may still identify additional requirements. Follow its current Android/TWA packaging and signing instructions. For a TWA, configure Digital Asset Links at `/.well-known/assetlinks.json` using the exact package name and SHA-256 certificate fingerprint from the generated signing key.

## Important

- This project contains server-side routes and must remain hosted online for those features to work.
- Do not publish secrets, API keys, or private credentials in GitHub or client-side environment variables.
- Keep the Android signing keystore and passwords backed up securely. Losing them can prevent updates to the installed app.
- The ZIP has not been built or deployed in this environment. Run `npm ci` and `npm run build` in Codespaces and resolve any reported errors before deploying.
