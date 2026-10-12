# Lesson 26: Mobile Apps with Expo and React Native

**Goal:** take your React skills to iOS and Android. You'll learn how React Native differs from React on the web, build screens with native components, navigate with Expo Router, store data on the device, use device features, and get an app onto a real phone.

**Time:** about 4 hours

**Prerequisite:** [Lesson 25](../25-react-router-framework-mode/README.md) or at least [Lesson 17](../17-global-state-zustand/README.md). This is part of the **optional Module 7**.

> **Last verified:** October 2026, with **Expo SDK 57** (React Native 0.86, React 19.2) and Node 24. Expo releases a new SDK a few times a year, and each SDK pins specific versions of React Native and every `expo-*` package. Check [docs.expo.dev](https://docs.expo.dev) for your SDK, and always install native packages with `npx expo install` so the versions match.

---

## What you will learn

- What React Native is, and what Expo adds
- Creating an app and running it on your phone with Expo Go
- Core components: `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `FlatList`, `Image`
- Styling with `StyleSheet` and Flexbox (and Tailwind with NativeWind)
- File-based navigation with Expo Router: stacks, tabs, dynamic routes
- Platform differences, safe areas, and the keyboard
- Storing data on the device: SQLite, key-value storage, and secure storage
- Device features: haptics, notifications, the camera, and more
- Using TanStack Query, Zustand, React Hook Form, and Zod in an app
- Accessibility on mobile
- Development builds, EAS Build, and publishing to the stores

---

## 1. React Native and Expo

**React Native** lets you write React components that render **real native views** (iOS `UIView`, Android `View`), not HTML in a web view. Your JavaScript runs in the Hermes engine on the phone, and React talks to native UI.

What stays the same: components, props, state, hooks, context, TypeScript, and libraries like TanStack Query, Zustand, React Hook Form, and Zod.

What changes: there's no DOM and no CSS. You use different built-in components, a JavaScript styling system, touch instead of mouse events, and new constraints (small screens, offline, battery, app store reviews).

**Expo** is the recommended way to build React Native apps. It provides:

| Piece | What it does |
|-------|--------------|
| `create-expo-app` | Project template with TypeScript and Expo Router |
| **Expo Go** | A phone app that runs your project without building anything, by scanning a QR code |
| **Expo SDK** | Tested native modules (`expo-camera`, `expo-sqlite`, `expo-notifications`...) |
| **Expo Router** | File-based navigation (like Next.js, for apps) |
| **Development builds** | Your own version of Expo Go with any native code you need |
| **EAS** (Expo Application Services) | Cloud builds, store submission, and over-the-air updates |

The React Native docs themselves recommend starting with a framework like Expo.

---

## 2. Create and run an app

```bash
npx create-expo-app@latest habits
cd habits
npx expo start
```

The terminal shows a QR code:

- **On your phone:** install **Expo Go** from the App Store or Google Play, then scan the QR code (with the Camera app on iOS, or from Expo Go on Android). Your phone and computer must be on the same Wi-Fi. If that's a problem, use `npx expo start --tunnel`
- **Android emulator:** press `a` (needs Android Studio)
- **iOS simulator:** press `i` (needs a Mac with Xcode)
- **Web:** press `w`. Expo apps can also run in the browser

Edit `src/app/index.tsx` and save. The app updates instantly (Fast Refresh). Shake the phone, or press `m` in the terminal, to open the developer menu.

The default template layout:

```
src/
├── app/                 # routes (Expo Router)
│   ├── _layout.tsx      # the root layout
│   ├── index.tsx        # the "/" screen
│   └── explore.tsx
├── components/
├── hooks/
└── constants/
assets/                  # images, fonts, the app icon
app.json                 # app name, icon, splash screen, permissions...
```

Only files in `src/app` are routes. Components, hooks, and helpers go elsewhere, like the feature-based structure from Lesson 21.

---

## 3. Core components

There's no `<div>`, `<p>`, or `<button>`. Use React Native's components:

| Web | React Native | Notes |
|-----|--------------|-------|
| `<div>` | `<View>` | A box for layout |
| `<p>`, `<span>`, `<h1>` | `<Text>` | **All text must be inside `<Text>`**. A raw string in a `View` is an error |
| `<button>`, clickable `<div>` | `<Pressable>` | Touchable area with pressed state. `Button` exists but can't be styled much |
| `<input>`, `<textarea>` | `<TextInput>` | `value` + `onChangeText` (receives the string, not an event) |
| `<img>` | `<Image>` (or `expo-image`) | Remote images need a `width` and `height` |
| A scrolling `<div>` | `<ScrollView>` | Screens don't scroll by default |
| `<ul>` with `.map()` | `<FlatList>` | Renders only visible rows (virtualized, like Lesson 20) |
| `onClick` | `onPress` | Also `onLongPress` |

```tsx
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Habit = { id: string; name: string; done: boolean };

export default function HabitsScreen() {
  const [name, setName] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);

  function addHabit() {
    if (!name.trim()) return;
    setHabits((h) => [...h, { id: String(Date.now()), name: name.trim(), done: false }]);
    setName('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="New habit"
        onSubmitEditing={addHabit}
        returnKeyType="done"
      />
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No habits yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setHabits((h) => h.map((x) => (x.id === item.id ? { ...x, done: !x.done } : x)))}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
          >
            <Text style={item.done ? styles.done : undefined}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { padding: 16, borderRadius: 8, backgroundColor: '#f2f2f2', marginBottom: 8 },
  pressed: { opacity: 0.6 },
  done: { textDecorationLine: 'line-through', color: '#888' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
});
```

All your React knowledge applies. Only the building blocks differ.

---

## 4. Styling

Styles are JavaScript objects. `StyleSheet.create` validates them and keeps them out of render:

- Property names are camelCase (`backgroundColor`), and numbers are **density-independent pixels** (no `px`, no `rem`)
- Every `View` is a **flex container**, and the default `flexDirection` is **`column`** (on the web it's `row`)
- `flex: 1` makes a view fill the available space. The root of most screens needs it
- No cascading: a style on a `View` doesn't affect the `Text` inside. Text styles only inherit from a parent `Text`
- Combine styles with arrays: `style={[styles.row, isActive && styles.active]}`
- `gap`, `rowGap`, `columnGap`, percentages, `position: 'absolute'`, and borders work like you'd expect

**Dark mode:** `useColorScheme()` returns `'light' | 'dark'`. Keep your colors in a theme object (like Lesson 08's tokens) and pick by scheme.

**Tailwind:** [NativeWind](https://www.nativewind.dev) lets you write `className="flex-1 p-4 bg-white dark:bg-black"` on native components. It's popular, but adds setup and its versions are tied to Tailwind versions. Check its docs for your Expo SDK.

---

## 5. Navigation with Expo Router

Expo Router is **file-based** like Next.js, but for native navigation patterns (stacks, tabs, modals):

```
src/app/
├── _layout.tsx               # root layout: a Stack
├── (tabs)/
│   ├── _layout.tsx           # a tab bar
│   ├── index.tsx             # "/"  (Today tab)
│   └── stats.tsx             # "/stats"
├── habit/
│   └── [id].tsx              # "/habit/42"
├── new-habit.tsx             # "/new-habit" (shown as a modal)
└── +not-found.tsx
```

- `_layout.tsx` defines how its children are presented: a stack, tabs, or a slot
- `(group)` folders organize routes without adding to the URL
- `[id].tsx` is a dynamic route

### The root stack

A **stack** pushes screens on top of each other with native animations and a back gesture:

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="habit/[id]" options={{ title: 'Habit' }} />
      <Stack.Screen name="new-habit" options={{ presentation: 'modal', title: 'New habit' }} />
    </Stack>
  );
}
```

### Tabs

```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="today" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Stats', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
```

The newest template uses **native tabs** (the platform's own tab bar) on iOS and Android, through components in `src/components/app-tabs*.tsx`. Both approaches work. Check the [tabs guide](https://docs.expo.dev/router/advanced/tabs/) for the current API.

### Moving between screens

```tsx
import { Link, router, useLocalSearchParams } from 'expo-router';

<Link href="/habit/42">Open habit</Link>
<Link href={{ pathname: '/habit/[id]', params: { id: habit.id } }}>Open</Link>

router.push('/new-habit');   // push a screen
router.back();               // go back
router.replace('/');         // replace the current screen

// in src/app/habit/[id].tsx
const { id } = useLocalSearchParams<{ id: string }>();
```

Like the web, the URL is the source of truth, so deep links (`myapp://habit/42`) work automatically.

---

## 6. Platform differences, safe areas, and the keyboard

**Platform checks:**

```tsx
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';     // 'ios' | 'android' | 'web'
```

Or create platform files: `Button.ios.tsx`, `Button.android.tsx`, `Button.native.tsx` (both mobile platforms), `Button.web.tsx`. The bundler picks the right one.

**Safe areas:** phones have notches, rounded corners, and home indicators. Keep content out of them:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>...</SafeAreaView>
```

Navigators with headers and tab bars handle most of this for you.

**Keyboard:** the on-screen keyboard can cover inputs. Wrap forms in `KeyboardAvoidingView` (with `behavior="padding"` on iOS), and use `keyboardShouldPersistTaps="handled"` on scroll views so taps on buttons work while the keyboard is open.

---

## 7. Storing data on the device

There's no `localStorage` on native. Options:

| Need | Use |
|------|-----|
| Structured data (lists, history, queries) | **`expo-sqlite`**: a real SQLite database on the phone |
| Small key-value settings | **`expo-sqlite/kv-store`** (AsyncStorage-compatible API) or `@react-native-async-storage/async-storage` |
| Secrets (auth tokens) | **`expo-secure-store`**: the iOS Keychain and Android Keystore |
| Files (images, exports) | `expo-file-system` |

Never store tokens in plain key-value storage: use `expo-secure-store` (same reasoning as `HttpOnly` cookies in Lesson 23).

```bash
npx expo install expo-sqlite
```

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';

async function migrate(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="habits.db" onInit={migrate}>
      <Stack />
    </SQLiteProvider>
  );
}
```

```tsx
// in a screen or a hook
import { useSQLiteContext } from 'expo-sqlite';

const db = useSQLiteContext();
const habits = await db.getAllAsync<Habit>('SELECT * FROM habits ORDER BY created_at DESC');
await db.runAsync('INSERT INTO habits (name, created_at) VALUES (?, ?)', name, new Date().toISOString());
```

Always use `?` placeholders for values (never build SQL from strings: that's SQL injection). Combine it with TanStack Query (queries call `getAllAsync`, mutations call `runAsync` and invalidate), or keep a Zustand store that loads from and saves to SQLite.

**Zustand persistence** works with the `persist` middleware and a storage adapter: pass `createJSONStorage(() => Storage)` with the `kv-store` import.

---

## 8. Device features

The Expo SDK wraps native APIs in JavaScript. A few examples:

```tsx
import * as Haptics from 'expo-haptics';
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // a small vibration on tap

import * as Notifications from 'expo-notifications';
await Notifications.requestPermissionsAsync();
await Notifications.scheduleNotificationAsync({
  content: { title: 'Time for your habits!' },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 },
});
```

Others: `expo-camera`, `expo-image-picker`, `expo-location`, `expo-sharing`, `expo-local-authentication` (Face ID / fingerprint), `expo-clipboard`.

Rules of thumb:

- **Ask for permissions in context** (when the user taps "Remind me", not on app launch) and handle "denied" gracefully
- Declare permission descriptions in `app.json` (the store reviewers read them)
- Some features (push notifications on Android, custom native modules) **don't work in Expo Go**. You need a development build (section 11). The docs list which ones

---

## 9. Using the libraries you know

| Library | On mobile |
|---------|-----------|
| TanStack Query | Works as-is. Add `focusManager` with `AppState` so refetch-on-focus means "app came to the foreground", and `onlineManager` with network status |
| Zustand | Works as-is. Use `persist` with a native storage adapter |
| React Hook Form + Zod | Works. Use `Controller` for `TextInput` (it uses `onChangeText`, not `onChange`) |
| Zod | Works everywhere |
| `fetch` | Works. `localhost` on your computer is **not** `localhost` on the phone: use your computer's LAN IP, or a deployed API |
| React Router, Tailwind (CSS), browser APIs | Don't apply. Use Expo Router, `StyleSheet` or NativeWind, and native modules |

---

## 10. Accessibility on mobile

Screen readers are **VoiceOver** (iOS) and **TalkBack** (Android). The same principles as Lesson 18, with native props:

```tsx
<Pressable
  onPress={toggle}
  accessibilityRole="button"
  accessibilityLabel="Mark Read 10 pages as done"
  accessibilityState={{ checked: done }}
  hitSlop={8}
>
  <Ionicons name={done ? 'checkbox' : 'square-outline'} size={28} />
</Pressable>
```

- Give icon-only buttons an `accessibilityLabel`, and set `accessibilityRole` (`button`, `link`, `header`, `checkbox`...)
- Recent React Native versions also accept web-style props (`role`, `aria-label`, `aria-checked`), which map to the same thing
- Touch targets should be at least **44×44 points**. Use `hitSlop` to enlarge small ones
- Support **Dynamic Type**: don't fix heights on text containers. Test with the largest font size in system settings
- Check contrast in light and dark mode, and announce important changes with `AccessibilityInfo.announceForAccessibility`
- Turn on VoiceOver or TalkBack and try your main flow. It's eye-opening

---

## 11. Development builds, EAS, and publishing

**Expo Go** is perfect for learning, but it only includes the Expo SDK's native modules. When you need other native code, custom app icons and names, or production behavior, create a **development build**: your own app with the developer tools built in.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android   # cloud build, installable APK
```

Or build locally with `npx expo run:android` / `npx expo run:ios` (needs Android Studio or Xcode). Expo's **prebuild** generates the native `android/` and `ios/` folders from `app.json` and config plugins, and since SDK 57 regenerates them from scratch by default, so keep native configuration in `app.json`, not hand-edited native files.

**Shipping to the stores:**

1. `eas build --profile production` creates store-ready builds (`.aab` for Google Play, `.ipa` for the App Store)
2. `eas submit` uploads them. You need a Google Play developer account (one-time fee) and an Apple Developer Program membership (yearly fee)
3. Store review: privacy policy, permission explanations, screenshots, and content rules
4. **EAS Update** pushes JavaScript-only fixes to installed apps without a new store release (within store rules)

You don't need to publish anything for this lesson. Running a development build or Expo Go on your own phone is enough.

---

## 12. Testing

- **Unit and component tests:** `jest-expo` with `@testing-library/react-native` (same ideas as Lesson 19: query by role and label, `userEvent`)
- **End-to-end:** Maestro (YAML flows that tap through the real app) is the common choice with Expo
- **Real devices:** test on at least one older Android phone. Performance can be very different from your simulator

---

## Common mistakes

| Mistake | What happens |
|---------|--------------|
| Text directly inside a `View` | "Text strings must be rendered within a `<Text>` component" error |
| Using `<div>`, `onClick`, or CSS files | Not available. Use `View`, `onPress`, `StyleSheet` |
| `npm install` for native packages | Version mismatch with the SDK. Use `npx expo install` |
| Long lists with `ScrollView` + `.map()` | Slow, memory-hungry. Use `FlatList` |
| Forgetting `flex: 1` on the root view | Content collapses or doesn't fill the screen |
| Remote `Image` without a size | It renders at 0×0 |
| Calling `http://localhost:3000` from the phone | Fails: localhost is the phone itself. Use your LAN IP or a deployed URL |
| Tokens in AsyncStorage/kv-store | Readable by anyone with the device backup. Use `expo-secure-store` |
| Asking for every permission at launch | Users deny them, and reviewers may reject the app |
| Expecting every library to work in Expo Go | Some need a development build |
| Ignoring safe areas and the keyboard | Content under the notch, inputs hidden by the keyboard |
| Copying web tutorials for navigation | Use Expo Router's `Stack`, `Tabs`, and `router` APIs |

---

## Key takeaways

- React Native renders real native views with the React you already know. Expo is the recommended way to build with it.
- Use `View`, `Text`, `Pressable`, `TextInput`, and `FlatList`, style with `StyleSheet` and Flexbox (column by default).
- Expo Router brings file-based routing with native stacks, tabs, and modals.
- Store data with `expo-sqlite`, settings in a key-value store, and secrets in `expo-secure-store`.
- Device features come from Expo SDK modules. Ask for permissions in context.
- Start in Expo Go, move to development builds when you need native code, and ship with EAS.

---

## Next steps

1. Do the [exercises](exercises.md).
2. Build the [project](project/README.md).
3. Continue with [Lesson 27: Desktop apps with Electron](../27-desktop-apps-with-electron/README.md).
