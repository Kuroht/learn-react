# Lesson 27: Desktop Apps with Electron

**Goal:** package a React app as a desktop application for Windows, macOS, and Linux. You'll learn Electron's process model, how React talks safely to the operating system through IPC, how to work with real files, menus, and windows, and how to build installers. You'll also learn the security rules that make Electron apps safe.

**Time:** about 4 hours

**Prerequisite:** [Lesson 26](../26-mobile-apps-with-expo/README.md) or at least [Lesson 23](../23-authentication-basics/README.md). This is the last lesson of the **optional Module 7**.

> **Last verified:** October 2026, with **Electron 44**, **Electron Forge 8**, Vite 8, and Node 24. Electron releases a new major version every 8 weeks (each with a new Chromium and Node), and only the latest three are supported, so keep it updated. Forge's Vite support is still marked *experimental* and may change between minor versions. Check [electronjs.org/docs](https://www.electronjs.org/docs/latest) and [electronforge.io](https://www.electronforge.io) if anything here doesn't match.

---

## What you will learn

- What Electron is, its trade-offs, and its alternatives
- The process model: main process, renderer, and preload script
- Creating an app with Electron Forge and adding React
- IPC: `ipcMain.handle`, `ipcRenderer.invoke`, and `contextBridge`
- Typing the bridge between React and the main process
- Working with files, dialogs, and app data folders
- Windows, menus, keyboard shortcuts, and native integration
- Electron's security model and checklist
- Packaging installers, code signing, and auto-updates
- Testing and debugging

---

## 1. What is Electron?

Electron bundles **Chromium** (the browser engine from Chrome) and **Node.js** into one app. Your UI is a web page (here, your React app), and a Node.js process gives it access to the operating system: files, menus, notifications, the system tray.

Apps built with it include VS Code, Slack, Discord, Figma's desktop app, and Obsidian.

| Pros | Cons |
|------|------|
| Use React, TypeScript, and your whole web toolkit | Large downloads (each app ships its own Chromium, 100+ MB) |
| One codebase for Windows, macOS, and Linux | More memory than a native app |
| Full Node.js access (files, processes, native modules) | That power makes security mistakes dangerous |
| Mature ecosystem, auto-updates, installers | Installers need code signing to avoid OS warnings |

Alternatives worth knowing: **Tauri** uses the operating system's own web view and a Rust backend (much smaller apps, different trade-offs), and **React Native for Windows/macOS** renders native controls. A plain **PWA** (an installable website) may be enough if you don't need file system or OS access.

---

## 2. The process model

An Electron app runs several processes:

```
┌───────────────── main process (Node.js) ─────────────────┐
│ app lifecycle, BrowserWindow, menus, dialogs, fs, IPC    │
└───────────────┬──────────────────────────────────────────┘
                │ IPC (messages)
┌───────────────┴──────────────── renderer process ────────┐
│  preload script  ──contextBridge──▶  your React app       │
│  (small, trusted)                    (a normal web page)  │
└───────────────────────────────────────────────────────────┘
```

- **Main process:** one per app. Runs Node.js. Creates windows, owns menus, reads files. This is the "backend"
- **Renderer process:** one per window. Runs your React app like a browser tab. By default it has **no Node.js access**, on purpose
- **Preload script:** runs in the renderer before your page, in an isolated context, with access to a small set of Electron APIs. It exposes a **minimal, safe API** to your page with `contextBridge`

This is like Lesson 23's client and server split: the renderer is the untrusted client, the main process is the server, and IPC calls are like API requests that the main process must validate.

---

## 3. Create an app with Electron Forge

**Electron Forge** is the official tool to create, run, package, and publish apps:

```bash
npx create-electron-app@latest notes --template=vite-typescript
cd notes
npm start
```

A window opens with "Hello World". The generated project:

```
src/
├── main.ts          # main process: creates the BrowserWindow
├── preload.ts       # preload script
├── renderer.ts      # the page's entry script
└── index.css
index.html           # the page loaded in the window
forge.config.ts      # packaging and makers configuration
vite.main.config.ts
vite.preload.config.ts
vite.renderer.config.ts
```

Each process has its own Vite config, because they build for different environments (Node for main, browser for renderer).

> A popular alternative to Forge is [electron-vite](https://electron-vite.org), which has a similar layout. The concepts in this lesson apply to both.

### Add React

```bash
npm install react react-dom
npm install -D @vitejs/plugin-react @types/react @types/react-dom
```

```ts
// vite.renderer.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

```tsx
// src/renderer.tsx (rename from renderer.ts, and update the script tag in index.html)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Add `<div id="root"></div>` to `index.html`, and set `"jsx": "react-jsx"` in `tsconfig.json`. From here on, the renderer is a normal React app: Tailwind, Zustand, TanStack Query, React Hook Form, and your Lesson 09 components all work the same way.

---

## 4. The main process

```ts
// src/main.ts (simplified)
import { app, BrowserWindow } from 'electron';
import path from 'node:path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Secure defaults (don't change these):
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);    // dev: Vite dev server with hot reload
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();   // macOS apps usually stay open
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();   // macOS dock click
});
```

`MAIN_WINDOW_VITE_DEV_SERVER_URL` and `MAIN_WINDOW_VITE_NAME` are injected by Forge's Vite plugin. `contextIsolation`, `nodeIntegration: false`, and `sandbox` are already the defaults in modern Electron. They're written out here so you never turn them off.

---

## 5. IPC: React talks to the main process

Your React code can't read files directly. It **asks** the main process through IPC (inter-process communication). The recommended pattern is **invoke/handle**, which works like an async function call:

```ts
// src/main.ts: the "server"
import { dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';

ipcMain.handle('notes:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
  });
  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
  const content = await fs.readFile(filePath, 'utf8');
  return { filePath, content };
});
```

```ts
// src/preload.ts: the bridge
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  openFile: (): Promise<{ filePath: string; content: string } | null> =>
    ipcRenderer.invoke('notes:openFile'),
};

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;
```

```tsx
// src/App.tsx: the React app
export function App() {
  const [note, setNote] = useState<{ filePath: string; content: string } | null>(null);

  return (
    <main>
      <button onClick={async () => setNote(await window.api.openFile())}>Open…</button>
      {note && <pre>{note.content}</pre>}
    </main>
  );
}
```

### Typing `window.api`

TypeScript doesn't know about `window.api` until you declare it:

```ts
// src/types/global.d.ts
import type { Api } from '../preload';

declare global {
  interface Window {
    api: Api;
  }
}
```

Now `window.api.openFile()` is fully typed, and the return type is defined once, in the preload.

### Events from main to renderer

For pushes from the main process (a menu click, a file changed on disk), send an event, and expose a **wrapped** subscribe function that returns an unsubscribe:

```ts
// main
win.webContents.send('menu:save');

// preload
onMenuSave: (callback: () => void) => {
  const listener = () => callback();
  ipcRenderer.on('menu:save', listener);
  return () => ipcRenderer.removeListener('menu:save', listener);
},

// React
useEffect(() => window.api.onMenuSave(() => save()), [save]);
```

Never expose `ipcRenderer` itself, or pass Electron's `event` object to the page.

---

## 6. Files and app data

Rules for working with the file system:

- **All file access happens in the main process.** The renderer asks through narrow IPC calls
- Let the **user choose** files with `dialog.showOpenDialog` / `showSaveDialog`. Don't accept arbitrary paths from the renderer, and validate any path you receive (is it inside the folder the user picked?)
- Store app data in `app.getPath('userData')` (the right per-user folder on each OS), not next to the app or in the user's home folder
- Use `fs/promises` (async), handle errors (file deleted, no permission, disk full), and write safely (write to a temp file, then rename)
- Settings are small JSON files in `userData`. Validate them with Zod when reading (Lesson 16)

```ts
import { app } from 'electron';
import path from 'node:path';

const settingsPath = path.join(app.getPath('userData'), 'settings.json');
```

---

## 7. Windows, menus, and native integration

- **Menus:** build the app menu with `Menu.buildFromTemplate([...])` and `Menu.setApplicationMenu(menu)`. Use `role`s (`'copy'`, `'paste'`, `'quit'`, `'toggleDevTools'`) for standard items, and `accelerator: 'CmdOrCtrl+S'` for shortcuts that work on every OS
- **macOS conventions:** the first menu is the app's name, and closing the last window doesn't quit
- **Window state:** remember size and position between launches (save to `userData`)
- **Unsaved changes:** listen for the window's `close` event, ask the renderer whether there are unsaved edits, and show a native confirmation dialog
- **Native features:** `Notification`, `shell.showItemInFolder`, the tray (`Tray`), dock badges, drag and drop of files onto the window, and dark mode (`nativeTheme.shouldUseDarkColors`, or `prefers-color-scheme` in CSS)
- **Opening links:** open external URLs in the user's browser with `shell.openExternal`, **only** after checking the URL is `https:`

---

## 8. Security

An Electron app with a security bug can be much worse than a website with one: an attacker who runs JavaScript in a renderer with Node access can read every file and run programs on the user's machine. Electron's [security checklist](https://www.electronjs.org/docs/latest/tutorial/security), in short:

1. **Keep the defaults:** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
2. **Expose a minimal API** through `contextBridge`: one function per action (`openFile`, `saveFile`), never generic ones like `readFile(path)` or `exec(command)`, and never raw `ipcRenderer`
3. **Validate every IPC message in the main process**, like an API endpoint: check argument types (Zod again), check paths, and check `event.senderFrame` comes from your own page
4. **Load only your own content.** Don't load remote websites into a window with a preload. If you must show web content, use a separate window with no preload
5. **Set a Content Security Policy**, for example `default-src 'self'; script-src 'self'`
6. **Block unexpected navigation and new windows:** handle `will-navigate` and `setWindowOpenHandler`, and deny by default
7. **Validate URLs before `shell.openExternal`** (allow only `https:`)
8. **Never `dangerouslySetInnerHTML` untrusted content.** Rendering Markdown? Sanitize the HTML (for example with DOMPurify), because XSS here means file system access
9. **Keep Electron updated.** Old Chromium versions have public exploits
10. **Use fuses** (`@electron/fuses`, configured in Forge) to disable features you don't need, like `runAsNode`
11. **Handle permission requests** (`session.setPermissionRequestHandler`): deny camera, microphone, and others unless you need them

```ts
// main.ts: deny all new windows and external navigation by default
win.webContents.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https://')) shell.openExternal(url);
  return { action: 'deny' };
});

win.webContents.on('will-navigate', (event, url) => {
  if (url !== win.webContents.getURL()) event.preventDefault();
});
```

---

## 9. Packaging and distribution

```bash
npm run package   # creates the app folder for your current OS (out/)
npm run make      # creates installers using the "makers" in forge.config.ts
```

| Platform | Typical maker |
|----------|---------------|
| Windows | Squirrel (`.exe` installer) or MSIX/WiX |
| macOS | DMG or ZIP |
| Linux | deb, rpm, AppImage, Flatpak |

Things to know before shipping to real users:

- **Build on each OS** (or in CI with a matrix of `windows-latest`, `macos-latest`, `ubuntu-latest`, Lesson 24). Cross-building is limited, especially for macOS
- **Code signing:** unsigned apps trigger scary warnings (Windows SmartScreen) or won't open (macOS Gatekeeper). macOS needs an Apple Developer account, signing, and **notarization**. Windows needs a code-signing certificate (or a cloud signing service)
- **Auto-updates:** Electron's `autoUpdater` with an update server, or the `update-electron-app` module with GitHub Releases for open-source apps. Publish releases with `npm run publish` and a publisher (for example `@electron-forge/publisher-github`)
- **App icon and metadata:** set in `forge.config.ts` (`packagerConfig.icon`, `name`, `appBundleId`)
- **Size:** keep dependencies in `dependencies` only if the main process needs them at runtime. Everything bundled by Vite can be a dev dependency

For this lesson, `npm run make` on your own computer is enough. Signing and publishing are optional.

---

## 10. Testing and debugging

- **Renderer:** open DevTools (`Ctrl+Shift+I` / `Cmd+Option+I`) like in Chrome, including React DevTools if you install them in development
- **Main process:** logs go to the terminal. Debug with `--inspect` and Chrome's `chrome://inspect`, or VS Code's debugger
- **Unit tests:** Vitest for React components (Lesson 19) and for pure main-process logic (keep file handling in small, testable functions)
- **End-to-end:** Playwright can launch and drive Electron apps (`_electron.launch()`), the same locators you already know
- **Crash reports:** Electron's `crashReporter`, or Sentry's Electron SDK (Lesson 24)

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Turning on `nodeIntegration` or off `contextIsolation` "to make it work" | Any XSS becomes full control of the user's computer |
| Exposing `ipcRenderer` or a generic `readFile(path)` to the page | The page (or injected script) can read any file |
| Trusting IPC arguments | Path traversal and crashes. Validate in main |
| Trying to use `fs` or `require` in React components | Not available in the renderer. Use IPC |
| Loading a remote website in your main window | Remote code runs with your preload's powers |
| `shell.openExternal(userInput)` | Can launch arbitrary programs. Allow only `https:` |
| Rendering Markdown as raw HTML | XSS with file system access. Sanitize |
| Saving data next to the app or in a hard-coded path | Fails on other OSes or without permissions. Use `app.getPath('userData')` |
| Synchronous IPC (`sendSync`) or blocking work in main | The whole app freezes |
| Forgetting macOS conventions (quit behavior, app menu) | The app feels broken on Mac |
| Shipping unsigned installers to users | Security warnings, or macOS refuses to open the app |
| Never updating Electron | Known Chromium vulnerabilities in your app |

---

## Key takeaways

- Electron = Chromium + Node.js. Your React app runs in a renderer, and the main process does OS work.
- The renderer has no Node access. A preload script exposes a minimal, typed API with `contextBridge`.
- Use `ipcRenderer.invoke` / `ipcMain.handle` like typed API calls, and validate every message in main.
- Do file work in main, let users pick files with dialogs, and store data in `app.getPath('userData')`.
- Keep the security defaults, set a CSP, block navigation and new windows, and keep Electron updated.
- Electron Forge creates, runs, and packages the app. Shipping widely needs code signing and auto-updates.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. You've finished Module 7! Head to the **final project** in the main [README](../../README.md).
