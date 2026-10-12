# Lesson 27 Project: Markdown Notes Desktop App

Build a desktop Markdown notes app with Electron and React: it reads and writes real `.md` files in a folder you choose, has a live preview, native menus and shortcuts, remembers your settings, and ships as an installer, all while following Electron's security checklist.

> **Last verified:** October 2026, with Electron 44 and Electron Forge 8 (Vite + TypeScript template). Check [electronjs.org/docs](https://www.electronjs.org/docs/latest) and [electronforge.io](https://www.electronforge.io) for the current APIs.

---

## Brief

A notes app like a tiny Obsidian:

- **Open a folder** of Markdown files (the "vault"), chosen with a native dialog
- **Sidebar** with the list of notes, search by name and content, and "New note"
- **Editor** (a textarea is fine) with a **live preview** of the rendered Markdown, side by side or toggled
- **Save** with `Ctrl/Cmd+S` and autosave after a pause, with an unsaved-changes indicator
- **Rename and delete** notes (delete moves the file to the OS trash)
- **Native menus** and shortcuts, a "Save changes?" prompt on close
- **Settings**: theme, font size, last opened vault, window size, all remembered
- **Installer** for your OS

Every stage ends with a **checkpoint**: something you should see in the app.

---

## Getting started

```bash
cd lessons/27-desktop-apps-with-electron/project
npx create-electron-app@latest starter --template=vite-typescript
cd starter
npm install react react-dom zod marked dompurify
npm install -D @vitejs/plugin-react @types/react @types/react-dom
npm start
```

Add React to the renderer as shown in the lesson. Tailwind is optional (`@tailwindcss/vite` in `vite.renderer.config.ts`).

Suggested structure:

```
src/
├── main/
│   ├── main.ts           # app lifecycle and window
│   ├── ipc.ts            # all ipcMain.handle registrations
│   ├── vault.ts          # file operations (pure-ish, testable)
│   ├── settings.ts       # read/write settings.json with Zod
│   └── menu.ts
├── preload/
│   └── preload.ts        # the typed API exposed with contextBridge
├── renderer/
│   ├── renderer.tsx
│   ├── App.tsx
│   ├── features/notes/ (components, hooks, store)
│   └── types/global.d.ts # declares window.api
└── shared/
    └── types.ts          # types shared by main, preload, and renderer
```

(Update the entry paths in `forge.config.ts` and the Vite configs if you move the files.)

Work in your own branch: `git checkout -b yourname/lesson-27`

---

## Stage 1: Secure shell

- [ ] React renders in the window, with Strict Mode
- [ ] `webPreferences` explicitly sets `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- [ ] A Content Security Policy in `index.html` (relaxed only in development for the Vite dev server)
- [ ] `setWindowOpenHandler` denies new windows (opening `https:` links in the browser), and `will-navigate` blocks navigation
- [ ] `session.setPermissionRequestHandler` denies all permission requests
- [ ] Window size and position are saved on close and restored on launch

**Checkpoint:** the app opens where you left it, and `require` / `process` are undefined in the renderer's DevTools console.

---

## Stage 2: The typed bridge

Define the API **once** in `shared/types.ts`:

```ts
export type NoteMeta = { name: string; modifiedAt: number };
export type VaultApi = {
  chooseVault(): Promise<string | null>;
  listNotes(): Promise<NoteMeta[]>;
  readNote(name: string): Promise<string>;
  saveNote(name: string, content: string): Promise<void>;
  createNote(name: string): Promise<NoteMeta>;
  renameNote(from: string, to: string): Promise<NoteMeta>;
  trashNote(name: string): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;
  onMenuAction(cb: (action: MenuAction) => void): () => void;
};
```

- [ ] The preload implements `VaultApi` with `ipcRenderer.invoke` (one channel per function) and exposes it with `contextBridge.exposeInMainWorld('api', api)`
- [ ] `global.d.ts` declares `window.api: VaultApi`
- [ ] The preload exposes **nothing else**: no `ipcRenderer`, no generic channels

**Checkpoint:** `window.api` autocompletes in your React code, and nothing else Electron-related is visible on `window`.

---

## Stage 3: Vault operations in main

In `main/vault.ts` and `main/ipc.ts`:

- [ ] `chooseVault` opens a folder dialog and remembers the chosen folder in settings
- [ ] Notes are referred to by **name** (`ideas.md`), never by full path from the renderer
- [ ] A `resolveNotePath(name)` helper that rejects names with `/`, `\`, `..`, or anything not ending in `.md`, and checks the resolved path is **inside** the vault folder
- [ ] Every handler validates its arguments with Zod before doing anything
- [ ] Every handler checks `event.senderFrame` is your app's own page
- [ ] `listNotes` returns names and modified times, sorted by most recent
- [ ] `saveNote` writes atomically (write a temp file, then rename)
- [ ] `trashNote` uses `shell.trashItem` (recoverable), not `fs.unlink`
- [ ] Errors become friendly messages for the renderer (no stack traces)

**Checkpoint:** from the DevTools console, `window.api.readNote('../../secret.txt')` is rejected.

---

## Stage 4: Sidebar and editor

- [ ] A first-run screen: "Choose a folder for your notes"
- [ ] The sidebar lists notes, highlights the selected one, and has a search box that filters by name (and, as a bonus, content)
- [ ] "New note" asks for a name (inline input, validated) and opens it
- [ ] The editor loads the note's content, and you can type freely
- [ ] An unsaved-changes dot next to the note name
- [ ] State management with Zustand or `useReducer` (Lessons 12 and 17): current vault, notes list, selected note, draft content, dirty flag
- [ ] Loading and error states for every async call (Lesson 18)

**Checkpoint:** you can create, open, and edit notes in a real folder, and see the files in your file explorer.

---

## Stage 5: Saving

- [ ] `Ctrl/Cmd+S` saves (through the app menu accelerator, Stage 7, or a keyboard handler for now)
- [ ] Autosave 1 second after the last keystroke (`useDebounce` from Lesson 13), with a small "Saved" status announced politely (`role="status"`)
- [ ] Switching notes with unsaved changes saves first (or asks)
- [ ] Rename (with validation and collision checks) and delete (with confirmation) from the sidebar

**Checkpoint:** edit, wait a second, and the file on disk is updated. Rename and trash work and appear in your file explorer.

---

## Stage 6: Live preview, safely

- [ ] Render Markdown with `marked` (or a similar library) to HTML
- [ ] **Sanitize** the HTML with DOMPurify before using `dangerouslySetInnerHTML`
- [ ] Links in the preview open in the system browser (only `https:`), never inside the app
- [ ] Toggle between editor, preview, and split view
- [ ] Test: put `<img src=x onerror="alert(1)">` and `<script>alert(1)</script>` in a note. Nothing runs

**Checkpoint:** the malicious note renders harmlessly, and normal Markdown (headings, lists, code, links) looks right.

---

## Stage 7: Native menus and closing safely

- [ ] An application menu with File (New Note, Open Folder…, Save, Close Window), Edit (standard roles), View (toggle preview, zoom, toggle DevTools in development only), and Help (link to your repo)
- [ ] macOS: the first menu is the app name, and the app stays open after closing the last window
- [ ] Menu items send typed actions to the renderer through `onMenuAction`, and the subscription is cleaned up in `useEffect`
- [ ] On window close with unsaved changes, a native dialog asks: Save, Don't Save, Cancel

**Checkpoint:** all menu items work, and you can't lose edits by closing the window.

---

## Stage 8: Settings

- [ ] `settings.json` in `app.getPath('userData')`, validated with Zod on read (fall back to defaults)
- [ ] Settings screen: theme (system/light/dark, following `nativeTheme` for "system"), editor font size, autosave on/off
- [ ] Settings apply immediately and survive a restart
- [ ] The last vault reopens on launch (and a missing folder is handled gracefully)

---

## Stage 9: Package and secure the build

- [ ] App name, icon, and `appBundleId` in `forge.config.ts`
- [ ] Fuses configured to disable `runAsNode` and enable cookie encryption and ASAR integrity (the Forge template has a fuses plugin, so check its options)
- [ ] `npm run make` produces an installer for your OS. Install it and test the main flows
- [ ] Write `RELEASE.md`: how to build for each OS, what code signing would require, and how auto-updates could work (`update-electron-app` + GitHub Releases)
- [ ] (Optional) A GitHub Actions matrix that runs `npm run make` on Windows, macOS, and Linux and uploads the installers as artifacts (Lesson 24)

---

## Stage 10: Test and review

- [ ] Unit tests (Vitest) for `resolveNotePath` (at least 10 tricky names) and for settings parsing
- [ ] Component tests for the sidebar search and the editor's dirty state, with `window.api` mocked
- [ ] (Optional) One Playwright end-to-end test that launches the app with `_electron.launch()`, creates a note, and saves it
- [ ] Go through Electron's [security checklist](https://www.electronjs.org/docs/latest/tutorial/security) and write `SECURITY.md`, one line per item: done, not applicable, or why not

```bash
npx tsc --noEmit
npm run lint
npx vitest run
```

All should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] React renderer with secure `webPreferences`, a CSP, and blocked navigation and windows
- [ ] A minimal, typed `contextBridge` API, with no raw `ipcRenderer` exposed
- [ ] All file access in main, with Zod validation, path checks, and sender checks on every handler
- [ ] Open a vault, list, search, create, edit, rename, trash, and save notes
- [ ] Autosave and an unsaved-changes guard on close
- [ ] Sanitized Markdown preview, with external links opened safely
- [ ] Native menus with shortcuts, and macOS conventions
- [ ] Validated settings in `userData`
- [ ] An installer built with `npm run make`
- [ ] Tests for path validation and settings, plus `SECURITY.md`
- [ ] `tsc`, lint, and tests pass

**Nice to have**

- [ ] Watch the vault folder for changes made outside the app (`fs.watch` in main, events to the renderer)
- [ ] Wiki links (`[[Other note]]`) that open other notes
- [ ] A tray icon with "New quick note"
- [ ] Multiple windows (one per vault)
- [ ] Auto-updates from GitHub Releases
- [ ] Rebuild the same app with Tauri and compare size and memory use

---

## Hints

<details>
<summary><code>window.api</code> is undefined</summary>

Check that `webPreferences.preload` points to the **built** preload file (Forge's Vite plugin outputs it next to `main.js`), that the preload calls `contextBridge.exposeInMainWorld`, and look for errors in the DevTools console (preload errors appear there).
</details>

<details>
<summary>The CSP blocks Vite's dev server or hot reload</summary>

In development the page loads from `http://localhost:5173` with inline scripts for HMR. Use a stricter CSP for production builds and a slightly relaxed one in development (for example by injecting the CSP from main with `session.defaultSession.webRequest.onHeadersReceived`, depending on `app.isPackaged`).
</details>

<details>
<summary>How do I check a path is inside the vault?</summary>

```ts
const vault = path.resolve(settings.vaultPath);
const target = path.resolve(vault, name);
if (!target.startsWith(vault + path.sep)) throw new Error('Invalid note name');
```

Also reject names that aren't plain file names (`path.basename(name) !== name`) and that don't end in `.md`.
</details>

<details>
<summary>How do I know which window sent an IPC message?</summary>

`BrowserWindow.fromWebContents(event.sender)` gives you the window, and `event.senderFrame?.url` tells you which page sent it. Compare it with your app's URL (the dev server URL in development, the `file://` path in production).
</details>

<details>
<summary>Closing with unsaved changes</summary>

In main, listen for `win.on('close', (e) => ...)`. Call `e.preventDefault()`, ask the renderer via IPC whether it's dirty, show `dialog.showMessageBox`, and then either save, or set a flag and call `win.close()` again (or `win.destroy()`).
</details>

<details>
<summary>The installer is huge</summary>

Electron apps are big (Chromium is included). Make sure only runtime dependencies of the **main process** are in `dependencies`. Everything Vite bundles for the renderer can be a dev dependency. Check what ends up in the ASAR archive with `npx @electron/asar list`.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 27: yourname`, with screenshots, your `SECURITY.md`, and the installer as a release artifact if you can.
4. Ask a friend to review it, and to try to read a file outside the vault from the DevTools console. A good review asks: what can a malicious note do?

---

## Done when

- The notes app works with real files, menus, and settings, and ships as an installer
- It passes your own attempts to read files outside the vault and to run scripts from a note
- `tsc`, lint, and tests pass
- Your PR is open and a friend has reviewed it

**You've finished Module 7!** Next up: the **final project**. See the main [README](../../../README.md).
