# Lesson 27: Exercises

Do these in a scratch app (`npx create-electron-app@latest scratch --template=vite-typescript`) with React added as in the lesson. Try each one **before** reading the answer.

---

## Exercise 1: Which process?

For each task, say whether it belongs in the **main process**, the **preload script**, or the **renderer (React)**.

1. Showing a list of notes with search
2. Reading a file from disk
3. Exposing `saveNote(content)` to the page
4. Creating the application menu
5. Validating that a path is inside the user's notes folder
6. Formatting a date for display
7. Showing a native "Save changes?" dialog

<details>
<summary>Answers</summary>

1) renderer · 2) main · 3) preload · 4) main · 5) main · 6) renderer · 7) main (triggered via IPC from the renderer if needed)
</details>

---

## Exercise 2: Spot the security problems

```ts
// main.ts
new BrowserWindow({
  webPreferences: { nodeIntegration: true, contextIsolation: false },
});
win.loadURL('https://some-cms.example.com/app');

ipcMain.handle('fs:read', (_e, path: string) => fs.readFile(path, 'utf8'));

// preload.ts
contextBridge.exposeInMainWorld('electron', { ipcRenderer });
```

List every problem and how to fix it.

<details>
<summary>Answers</summary>

1. `nodeIntegration: true` and `contextIsolation: false`: any script in the page gets full Node access. Keep the secure defaults (and `sandbox: true`).
2. Loading a remote URL into a privileged window: if that site is compromised, so is the user's machine. Load local, bundled files.
3. A generic `fs:read` with any path: the page can read SSH keys or passwords. Expose specific actions and validate paths.
4. Exposing the whole `ipcRenderer`: the page can call any channel. Expose narrow wrapper functions instead.
</details>

---

## Exercise 3: Your first IPC call

1. Add `ipcMain.handle('app:getVersion', () => app.getVersion())`
2. Expose `getVersion()` in the preload with `contextBridge`
3. Type `window.api` with a global declaration
4. Show the version in your React app's footer
5. Try to call `require('fs')` in a React component. What happens, and why is that good?

---

## Exercise 4: Open and save files

1. Add "Open…" that shows `dialog.showOpenDialog` filtered to `.md` and `.txt`, reads the file in main, and returns `{ filePath, content }`
2. Show the content in a `textarea` in React
3. Add "Save" that writes back to the same path (only paths you opened), and "Save As…" with `showSaveDialog`
4. Handle errors: the file was deleted, or you have no permission. Show a friendly message in React
5. Why should the renderer never send an arbitrary path to save to?

---

## Exercise 5: Events from main to React

1. Add a "File → Save" menu item with the `CmdOrCtrl+S` accelerator
2. When clicked, send `menu:save` to the focused window
3. In the preload, expose `onMenuSave(callback)` that returns an unsubscribe function
4. Subscribe in a React `useEffect` and clean up. Open and close the component several times. Does the save run more than once? Why not?

---

## Exercise 6: Settings in `userData`

1. Save `{ theme, fontSize }` to `settings.json` in `app.getPath('userData')`
2. Load it at startup, and validate with Zod (fall back to defaults if invalid)
3. Find the file on your disk. Where is it on your OS?
4. Corrupt the file by hand and restart. Does the app survive?

---

## Exercise 7: Lock it down

1. Add a Content Security Policy `<meta>` tag to `index.html`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`. Does dev mode still work? (You may need to allow the Vite dev server in development only.)
2. Add `setWindowOpenHandler` that denies new windows and opens `https:` links in the browser
3. Add a `will-navigate` handler that blocks navigation away from your app
4. Add a link to `javascript:alert(1)` and to `file:///etc/passwd` in your page. What happens when you click them?

---

## Exercise 8: Unsaved changes

1. Track a `dirty` flag in React when the text changes
2. On the window's `close` event in main, ask the renderer whether there are unsaved changes (IPC)
3. If yes, show a native dialog: Save, Don't Save, Cancel
4. Make sure the app can still quit when the user chooses "Don't Save"

---

## Exercise 9: Package it

1. Run `npm run package` and open the generated app in `out/`
2. Run `npm run make` and install it. Where did it install?
3. Set an app name and icon in `forge.config.ts` and rebuild
4. Open the installer on a friend's computer. Which warning does the OS show, and why? (Code signing.)

---

## Exercise 10: Compare

Write a short paragraph: for a Markdown notes app, what would change if you built it as (a) a PWA, (b) an Electron app, (c) a Tauri app? Consider file access, size, updates, and security.

---

## Check yourself

You're ready for the project if you can answer these without looking:

- What do the main process, renderer, and preload script each do?
- Why doesn't the renderer have Node.js access?
- What do `contextBridge`, `ipcRenderer.invoke`, and `ipcMain.handle` do?
- Why must IPC arguments be validated in main?
- Where should an app store its data and settings?
- Name five items from Electron's security checklist.
- What do `npm run package` and `npm run make` produce?
- Why do installers need code signing?
