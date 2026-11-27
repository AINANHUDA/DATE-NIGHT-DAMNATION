# Build and deploy

From the game directory in Windows PowerShell:

```powershell
node tools/qa-check.cjs
node tools/release-build.mjs "$env:LOCALAPPDATA\MONKEY-MIND-III\release-monkey-mind-iii"
```

Only after RELEASE READY:

```powershell
cd "$env:LOCALAPPDATA\MONKEY-MIND-III\release-monkey-mind-iii"
npx.cmd vercel --prod
```

The external release builder preserves the existing .vercel link. Confirm the project is monkey-mind-iii-rescue before deploying. Do not deploy the source or backup folder. Existing production: https://monkey-mind-iii-rescue.vercel.app
