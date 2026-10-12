# Lesson 10 Project: Weather App

Build a weather app that searches for a city and shows its current weather, using a free API with no key.

> **Last verified:** October 2026. The [Open-Meteo](https://open-meteo.com/en/docs) API is free for non-commercial use and needs no API key. Check its docs if a response shape has changed.

---

## Brief

A search box where you type a city name. The app finds matching places, lets you choose one, and shows the current temperature, weather condition, wind speed, and a daily forecast for the next few days. It handles loading, errors, and empty results, and remembers the last city.

The point is to practice **effects, cleanup, fetching, and race conditions**.

Every stage ends with a **checkpoint**: something you should see in the browser.

---

## The API

**1. Geocoding** (city name to coordinates):

```
https://geocoding-api.open-meteo.com/v1/search?name=Lisbon&count=5&language=en
```

Returns `{ results?: [{ id, name, country, admin1, latitude, longitude }] }`. Note: `results` is **missing** when nothing matches.

**2. Forecast** (coordinates to weather):

```
https://api.open-meteo.com/v1/forecast?latitude=38.72&longitude=-9.14
  &current=temperature_2m,weather_code,wind_speed_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &timezone=auto
```

Open each URL in your browser first and read the JSON before writing any code.

The `weather_code` values are WMO codes (0 = clear sky, 1-3 = cloudy, 45/48 = fog, 51-67 = drizzle/rain, 71-77 = snow, 80-82 = showers, 95-99 = thunderstorm). Check the Open-Meteo docs for the full table.

---

## Getting started

```bash
cd lessons/10-useeffect-and-side-effects/project
npm create vite@latest starter -- --template react-ts
cd starter
npm install
npm install tailwindcss @tailwindcss/vite
npm run dev
```

Tailwind is optional, but recommended. Use whatever styling you like.

Work in your own branch: `git checkout -b yourname/lesson-10`

---

## Stage 1: Types and API functions

Create `src/types.ts` for the two responses (only the fields you use) and a `Place` type.

Create `src/api.ts`:

```ts
export async function searchPlaces(name: string, signal: AbortSignal): Promise<Place[]> { ... }
export async function getWeather(place: Place, signal: AbortSignal): Promise<Weather> { ... }
```

- [ ] Both accept an `AbortSignal`
- [ ] Both throw an `Error` when `!res.ok`
- [ ] `searchPlaces` returns `[]` when `results` is missing
- [ ] Neither function uses `any`

**Checkpoint:** call each from the browser console (or a temporary `useEffect`) and see data.

---

## Stage 2: A request-state type

```ts
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };
```

- [ ] A **generic** type, so it works for places and weather (you'll reuse it in Lesson 13)
- [ ] Components switch on `status`

---

## Stage 3: City search with debounce

- [ ] A controlled search input
- [ ] `debouncedQuery` updates 400ms after the user stops typing (effect with cleanup)
- [ ] Do not search for fewer than 2 characters (`idle` state with a hint)
- [ ] An effect fetches places when `debouncedQuery` changes, with `AbortController`
- [ ] Shows loading, errors, and "No cities found for ..."
- [ ] Results are a list of buttons: "Lisbon, Lisbon, Portugal"

**Checkpoint:** typing "lis" quickly produces **one** request (check the Network tab), and stale responses never overwrite newer ones.

---

## Stage 4: Current weather

- [ ] `selectedPlace` state (a `Place | null`)
- [ ] An effect fetches the weather when `selectedPlace` changes, with abort
- [ ] Shows the city name, temperature (rounded, with °C), wind speed, and a text description plus an emoji for the weather code
- [ ] A `describeWeather(code: number)` helper that returns `{ label, emoji }` (a lookup object, with a fallback for unknown codes)
- [ ] Loading skeleton or message, and an error message with a "Try again" button

**Checkpoint:** choose several cities quickly. The screen always ends up showing the **last** one you clicked.

---

## Stage 5: Daily forecast

- [ ] A row or list for the next 5 days: weekday name, emoji, min and max
- [ ] Zip the parallel arrays from the API (`time[]`, `temperature_2m_max[]`, ...) into an array of typed objects in a helper function
- [ ] Format dates with `Intl.DateTimeFormat` (`{ weekday: 'short' }`)
- [ ] A temperature unit toggle (°C / °F) that converts the numbers **without** refetching. This is derived state

**Checkpoint:** toggling units changes the numbers but makes no network requests.

---

## Stage 6: Remember the last city

- [ ] Save the selected place to `localStorage` in an effect
- [ ] On first load, read it with a lazy `useState` initializer
- [ ] **Validate** what you read (it's outside data!): wrap `JSON.parse` in `try/catch` and check the shape
- [ ] Add a "Clear" button that removes it
- [ ] Set `document.title` to "Weather in {city}" in an effect

**Checkpoint:** reload the page and the last city's weather appears right away.

---

## Stage 7: Cleanup review

- [ ] Every effect with a timer, listener, or request has a cleanup
- [ ] The `react-hooks/exhaustive-deps` lint rule shows **no** warnings
- [ ] Test in Strict Mode: no duplicate or leaked behavior
- [ ] Throttle the network to Slow 3G and click around. Check for flashes of wrong data
- [ ] Go offline and search. The error message is friendly

---

## Stage 8: Check your work

```bash
npm run build
npm run lint
```

Both should pass. No `any`, no silenced lint rules.

---

## Requirements checklist

**Must have**

- [ ] Typed API functions that accept an `AbortSignal` and check `res.ok`
- [ ] A generic `RequestState<T>` with idle, loading, error, and success
- [ ] Debounced search with cleanup
- [ ] Weather fetched when the selected place changes, with no race conditions
- [ ] Loading, error (with retry), and empty states
- [ ] Unit toggle as derived state
- [ ] Last city stored in `localStorage` and validated when read
- [ ] No `any`, no lint warnings
- [ ] `npm run build` and `npm run lint` pass

**Nice to have**

- [ ] A "Use my location" button with `navigator.geolocation`
- [ ] Refresh the weather automatically every 10 minutes (and clean up the timer)
- [ ] Recent searches (the last 5)
- [ ] A background that changes with the weather
- [ ] Keyboard navigation for the search results

---

## Hints

<details>
<summary>My effect runs twice</summary>

That's Strict Mode in development, on purpose. Make sure the cleanup aborts the request and you ignore `AbortError`. In production, it runs once.
</details>

<details>
<summary>I get "Cannot read properties of undefined (reading 'map')" for a search with no results</summary>

The API omits `results` when nothing is found. Use `data.results ?? []`.
</details>

<details>
<summary>How do I ignore the AbortError?</summary>

```ts
catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') return;
  setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
}
```
</details>

<details>
<summary>How do I turn the parallel arrays into objects?</summary>

```ts
const days = daily.time.map((date, i) => ({
  date,
  code: daily.weather_code[i],
  max: daily.temperature_2m_max[i],
  min: daily.temperature_2m_min[i],
}));
```
</details>

<details>
<summary>The weather doesn't refetch when I pick the same city again</summary>

That's expected: the dependency didn't change. For a manual "Refresh", add a `refreshKey` number to state, include it in the dependencies, and increment it from the button.
</details>

<details>
<summary>ESLint wants me to add a function to the dependency array</summary>

Move the function inside the effect, move it outside the component, or (see Lesson 11) wrap it with `useCallback`. Don't disable the rule.
</details>

---

## How to submit

1. Work in your own branch.
2. Commit with clear messages, for example one per stage.
3. Push and open a pull request titled `Lesson 10: yourname`, with a screenshot.
4. Ask a friend to review it. A good review asks: which effects could be deleted, and what happens on a slow network?

---

## Done when

- The app searches, shows, and remembers weather correctly under slow and offline conditions
- Every effect has the right dependencies and cleanup
- `npm run build` and `npm run lint` pass
- Your PR is open and a friend has reviewed it

Next up: **Lesson 11: `useRef`, `useMemo`, `useCallback`**.
