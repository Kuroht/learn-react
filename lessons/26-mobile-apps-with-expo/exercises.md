# Lesson 26: Exercises

Do these in a scratch Expo app (`npx create-expo-app@latest scratch`) running in Expo Go on your phone, or in a simulator/emulator. Try each one **before** reading the answer.

---

## Exercise 1: Translate from the web

Rewrite this web component for React Native:

```tsx
function Profile({ name, onFollow }: { name: string; onFollow: () => void }) {
  return (
    <div className="card">
      <img src="https://i.pravatar.cc/100" alt="" width={64} height={64} />
      <h2>{name}</h2>
      <p>Joined 2026</p>
      <button onClick={onFollow}>Follow</button>
    </div>
  );
}
```

<details>
<summary>Answer</summary>

```tsx
function Profile({ name, onFollow }: { name: string; onFollow: () => void }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={{ width: 64, height: 64, borderRadius: 32 }} />
      <Text style={styles.name} accessibilityRole="header">{name}</Text>
      <Text>Joined 2026</Text>
      <Pressable onPress={onFollow} accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>Follow</Text>
      </Pressable>
    </View>
  );
}
```

`div` → `View`, all text in `Text`, `img` → `Image` with a `source` object and a size, `button` → `Pressable` with a `Text` child, `onClick` → `onPress`, and styles from `StyleSheet.create`.
</details>

---

## Exercise 2: Flexbox, mobile style

Build these layouts with `View` and `StyleSheet` only:

1. A header bar with a title on the left and an icon button on the right
2. A card with an image on top and two lines of text below
3. A row of three equal-width stat boxes
4. A full-screen layout with a scrolling list and a button fixed at the bottom

What's different from CSS Flexbox on the web?

<details>
<summary>Hint</summary>

The default `flexDirection` is `column`, and `flex: 1` (not `height: 100%`) usually fills space. There's no `display: grid`.
</details>

---

## Exercise 3: A real list

Render 1,000 items:

1. With `ScrollView` and `.map()`. Scroll fast. How does it feel? How long does it take to open the screen?
2. With `FlatList`, `keyExtractor`, and `ListEmptyComponent`
3. Add pull-to-refresh (`refreshing` and `onRefresh`)
4. Add `ItemSeparatorComponent` and a `ListHeaderComponent`

---

## Exercise 4: Forms and the keyboard

Build a "new habit" form with a name (required) and a daily goal (a number):

1. `TextInput` with `onChangeText`, `keyboardType="number-pad"` for the goal, and `returnKeyType`
2. Focus the next field when pressing "next" on the keyboard (refs, Lesson 11)
3. Wrap it so the keyboard never covers the inputs
4. Use React Hook Form's `Controller` and a Zod schema. Why can't you just spread `register()` like on the web?

---

## Exercise 5: Navigation

With Expo Router, create:

1. Two tabs: "Today" and "Stats"
2. A detail screen at `habit/[id].tsx` opened from a list item with `Link` or `router.push`
3. A modal screen for "New habit" (`presentation: 'modal'`)
4. A `+not-found.tsx` screen

Read the `id` with `useLocalSearchParams`. Then open the app with a deep link (`npx uri-scheme open myapp://habit/1 --android`, or the scheme from `app.json`). Does it open the right screen?

---

## Exercise 6: Platform differences

1. Show "iOS", "Android", or "Web" on screen with `Platform.OS`
2. Create `Greeting.ios.tsx` and `Greeting.android.tsx` with different text, and import `./Greeting`. What happens?
3. Put a screen without a header under the notch. Fix it with `SafeAreaView`
4. Turn on dark mode on the phone and adapt your colors with `useColorScheme()`

---

## Exercise 7: Storage

1. Store a "username" setting with `expo-sqlite/kv-store`. Kill the app and reopen it
2. Store a fake auth token with `expo-secure-store`. Why not in the kv-store?
3. Create a `notes` table with `expo-sqlite`. Insert, list, and delete notes with `?` placeholders
4. What would happen if you built the SQL with a template string and a user typed `'); DROP TABLE notes; --`?

---

## Exercise 8: Device features

Pick two:

1. Vibrate lightly when a habit is completed (`expo-haptics`)
2. Schedule a daily reminder notification, after asking for permission when the user taps "Remind me"
3. Let the user pick a photo with `expo-image-picker` and show it
4. Share a text summary with the system share sheet (`expo-sharing` or React Native's `Share`)

For each, what happens if the user denies the permission? Handle it.

---

## Exercise 9: Data from your API

1. Fetch posts from `https://jsonplaceholder.typicode.com/posts` with TanStack Query
2. Show loading, error, and empty states
3. Make "refetch on focus" work when the app returns from the background (`focusManager` with `AppState`)
4. Point it at a local server on your computer. Why does `localhost` fail on the phone, and what's the fix?

---

## Exercise 10: Accessibility

1. Turn on VoiceOver (iOS) or TalkBack (Android) and try to complete a habit in your app
2. Add `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` until it reads well
3. Set the system font size to the largest. Does anything get cut off?
4. Make every touch target at least 44×44

---

## Check yourself

You're ready for the project if you can answer these without looking:

- How is React Native different from React on the web? What stays the same?
- What does Expo add, and what is Expo Go?
- Why must text be inside `<Text>`?
- What's the default `flexDirection`, and why does the root often need `flex: 1`?
- Why use `FlatList` instead of `.map()` in a `ScrollView`?
- How do stacks, tabs, and dynamic routes work in Expo Router?
- Where do you store structured data, settings, and secrets?
- Why install native packages with `npx expo install`?
- When do you need a development build instead of Expo Go?
