# Lesson 26 Project: Habit Tracker App

Build a habit tracker for iOS and Android with Expo: tabs and stack navigation, a local SQLite database, streaks and stats, daily reminders, and an accessible, dark-mode-ready UI that runs on your own phone.

> **Last verified:** October 2026, with Expo SDK 57. Check [docs.expo.dev](https://docs.expo.dev) for your SDK, and install native packages with `npx expo install`.

---

## Brief

A habit tracker with:

| Screen | Route | What it does |
|--------|-------|--------------|
| **Today** (tab) | `/` | Today's habits with a check button each, and a progress ring or bar |
| **Stats** (tab) | `/stats` | Current and best streak per habit, a 7-day history, completion rate |
| **Habit detail** | `/habit/[id]` | History calendar for one habit, edit and delete |
| **New / edit habit** | `/habit/new` (modal), `/habit/[id]/edit` | Name, color, days of the week, optional reminder time |
| **Settings** (tab) | `/settings` | Theme, reminders on/off, export data, reset |

Data lives on the device in SQLite and survives restarts. No server needed.

Every stage ends with a **checkpoint**: something you should see on your phone.

---

## Getting started

```bash
cd lessons/26-mobile-apps-with-expo/project
npx create-expo-app@latest starter
cd starter
npx expo install expo-sqlite expo-haptics expo-notifications expo-sharing
npm install zod zustand
npx expo start
```

Open it in **Expo Go** on your phone (scan the QR code). Remove the example screens from the template once you've looked at them.

Suggested structure:

```
src/
├── app/                      # routes only
│   ├── _layout.tsx           # Stack + SQLiteProvider + theme
│   ├── (tabs)/ (_layout.tsx, index.tsx, stats.tsx, settings.tsx)
│   ├── habit/ ([id].tsx, new.tsx, [id]/edit.tsx)
│   └── +not-found.tsx
├── features/
│   ├── habits/ (db.ts, queries.ts, schemas.ts, streaks.ts, components/)
│   └── reminders/ (notifications.ts)
├── components/               # shared UI: Button, Card, Screen, EmptyState
└── theme/                    # colors for light and dark
```

Work in your own branch: `git checkout -b yourname/lesson-26`

---

## Stage 1: Navigation skeleton

- [ ] Root `Stack` with the tabs group, the habit detail screen, and the "new habit" screen as a modal
- [ ] Three tabs (Today, Stats, Settings) with icons and accessible labels
- [ ] Placeholder screens for every route, and a `+not-found.tsx`
- [ ] A "+" button in the Today tab's header that opens the new-habit modal

**Checkpoint:** you can move between all screens on your phone, and the modal slides up and can be dismissed.

---

## Stage 2: Theme and shared components

- [ ] Light and dark color tokens in `src/theme`, chosen with `useColorScheme()` (and a manual override later from Settings)
- [ ] `Screen` (safe area + background), `Button` (a `Pressable` with pressed/disabled styles, `accessibilityRole="button"`), `Card`, and `EmptyState` components
- [ ] All touch targets at least 44×44
- [ ] No inline style objects recreated on every render for list items (use `StyleSheet.create`)

**Checkpoint:** switching the phone to dark mode updates every screen.

---

## Stage 3: The database

- [ ] `SQLiteProvider` in the root layout with an `onInit` migration that creates tables:
  - `habits` (`id`, `name`, `color`, `days` as a bitmask or text, `reminder_time` nullable, `created_at`, `archived`)
  - `completions` (`habit_id`, `date` as `YYYY-MM-DD`, primary key on both)
- [ ] A `user_version` pragma check so the migration only runs when needed (and can evolve later)
- [ ] Typed functions in `features/habits/db.ts`: `listHabits`, `getHabit`, `createHabit`, `updateHabit`, `deleteHabit`, `toggleCompletion(habitId, date)`, `listCompletions(from, to)`
- [ ] **Every** query uses `?` placeholders
- [ ] Zod schemas validate rows read from the database

**Checkpoint:** create a habit from a temporary button, kill the app, reopen it, and it's still there.

---

## Stage 4: Create and edit habits

- [ ] A form with a name (`TextInput`), a color picker (a row of `Pressable` swatches), and day-of-week toggles
- [ ] React Hook Form with `Controller` and a Zod schema (name 1 to 40 characters, at least one day)
- [ ] Errors shown under fields and announced to screen readers
- [ ] The keyboard never covers the inputs
- [ ] Save closes the modal and the Today list shows the new habit
- [ ] The edit screen reuses the same form, pre-filled
- [ ] Delete asks for confirmation (`Alert.alert`) and removes the habit and its completions

**Checkpoint:** you can add, edit, and delete habits, and invalid input shows clear errors.

---

## Stage 5: Today screen

- [ ] A `FlatList` of habits scheduled for today, each with a large check button
- [ ] Tapping toggles today's completion, with a light haptic and an instant UI update (optimistic, then persist)
- [ ] A progress summary ("3 of 5 done") that updates immediately, and is announced for screen readers
- [ ] An empty state ("No habits for today. Tap + to add one") with a button
- [ ] Pull to refresh
- [ ] Data access through TanStack Query (queries over SQLite, mutations that invalidate) **or** a Zustand store that loads from and writes to SQLite. Choose one and explain why in `NOTES.md`

**Checkpoint:** checking a habit is instant and survives a restart.

---

## Stage 6: Streaks and stats

- [ ] `streaks.ts`: pure functions `currentStreak(completions, days, today)` and `bestStreak(...)`, which only count the days the habit is scheduled
- [ ] Unit tests for them with `jest-expo` (or plain checks in a script). Edge cases: today not done yet, skipped days, a habit created yesterday
- [ ] Stats tab: per-habit current and best streak, completion rate for the last 30 days, and a simple 7-day bar row built with `View`s
- [ ] Habit detail: a month calendar grid with completed days highlighted, and tap a past day to toggle it

**Checkpoint:** the streak numbers match what you'd calculate by hand.

---

## Stage 7: Reminders

- [ ] A "Remind me at…" time in the habit form (a simple hour/minute picker, or `@react-native-community/datetimepicker` installed with `npx expo install`)
- [ ] Ask for notification permission **only** when the user turns a reminder on, and handle "denied" with a message and a link to settings (`Linking.openSettings()`)
- [ ] Schedule a daily local notification per habit with a reminder. Reschedule on edit and cancel on delete
- [ ] Tapping the notification opens that habit's screen (deep link through the notification data)
- [ ] A Settings toggle to turn all reminders off

Note: local notifications work in Expo Go. Remote **push** notifications need a development build on Android, and are not part of this project.

**Checkpoint:** set a reminder two minutes from now, close the app, and it appears.

---

## Stage 8: Settings and export

- [ ] Theme: System / Light / Dark, saved with `expo-sqlite/kv-store` (or Zustand `persist`)
- [ ] Export: create a JSON file of habits and completions and open the share sheet
- [ ] Reset all data, with a two-step confirmation
- [ ] App version shown at the bottom (from `expo-constants`)

---

## Stage 9: Accessibility and polish

- [ ] Run through every flow with VoiceOver or TalkBack. Fix unlabeled buttons, wrong roles, and confusing order
- [ ] Set the largest system font size and fix anything that's cut off
- [ ] Check contrast for every habit color on both backgrounds (add a text label so color isn't the only signal)
- [ ] Respect "reduce motion" (`AccessibilityInfo.isReduceMotionEnabled()`) for any animation
- [ ] Test on Android and iOS if you can (a friend's phone counts)

---

## Stage 10: (Optional) Development build

- [ ] `eas build:configure`, then `eas build --profile development --platform android` (or `npx expo run:android` locally)
- [ ] Set an app name, icon, and splash screen in `app.json`
- [ ] Install the build on your phone and use the app outside Expo Go

---

## Stage 11: Check your work

```bash
npx tsc --noEmit
npx expo lint        # the template's lint setup
npx expo-doctor      # checks your dependencies match the SDK
```

All should pass. No `any`.

---

## Requirements checklist

**Must have**

- [ ] Expo Router with a root stack, three tabs, a modal, and a dynamic route
- [ ] SQLite storage with migrations and parameterized queries, validated with Zod
- [ ] Create, edit, delete habits with a validated form that handles the keyboard
- [ ] Today screen with instant check-off, haptics, and an empty state
- [ ] Pure, tested streak functions and a stats screen
- [ ] Daily reminders that ask for permission in context and handle denial
- [ ] Light and dark themes
- [ ] Accessibility checked with a real screen reader and large fonts
- [ ] `NOTES.md` with your state-management choice and what surprised you about mobile
- [ ] `tsc` and `expo-doctor` pass

**Nice to have**

- [ ] A home-screen widget or app shortcut (needs a development build)
- [ ] Animations with `react-native-reanimated` (respecting reduce motion)
- [ ] Sync to your own API from Lesson 25 with an auth token in `expo-secure-store`
- [ ] A Maestro end-to-end flow: add a habit and check it off
- [ ] Run the same app on the web with `npx expo start --web` and note what breaks

---

## Hints

<details>
<summary>"Text strings must be rendered within a &lt;Text&gt; component"</summary>

A string (or a number, or a stray `{' '}`) is a direct child of a `View`. Wrap it in `<Text>`. Watch out for `{count && <Badge />}` when `count` is `0`: it renders the number `0` outside a `Text` (the `0` trap from Lesson 06).
</details>

<details>
<summary>My package version doesn't match the SDK</summary>

Run `npx expo install --fix` (or `npx expo-doctor`) to align versions. Always add native packages with `npx expo install <name>`.
</details>

<details>
<summary>How do I store "days of the week"?</summary>

A 7-bit number is compact: Monday = 1, Tuesday = 2, Wednesday = 4, and so on. `days & (1 << weekday)` checks a day. Or store a string like `"1,2,3,4,5"`. Validate either with Zod when reading.
</details>

<details>
<summary>How do I get today's date as <code>YYYY-MM-DD</code> in the user's timezone?</summary>

Don't use `toISOString()` (that's UTC and can be "yesterday" in the evening). Build it from `getFullYear()`, `getMonth() + 1`, and `getDate()` with zero padding, and keep all date logic in one tested helper.
</details>

<details>
<summary>Notifications don't appear</summary>

Check that permission was granted, that you scheduled with a valid trigger, and that you set a notification handler (`Notifications.setNotificationHandler`) if you want them shown while the app is open. On Android, create a notification channel. Remote push needs a development build.
</details>

<details>
<summary>The list doesn't update after I toggle a habit</summary>

If you use TanStack Query, invalidate (or update) the right query keys in the mutation's `onSuccess`/`onSettled`. If you use Zustand, update the store state immutably after writing to SQLite.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 26: yourname`, with screenshots or a short screen recording from your phone in light and dark mode.
4. Ask a friend to install it through Expo Go and review it. A good review asks: can I use it one-handed, with a screen reader, and with huge text?

---

## Done when

- The habit tracker runs on your phone, stores data locally, and reminds you
- Streaks are correct and tested
- It's usable with a screen reader and large fonts
- Your PR is open and a friend has reviewed it

Next up: **Lesson 27: Desktop apps with Electron**.
