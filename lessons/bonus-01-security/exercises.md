# Bonus 01: Exercises

Do these in a scratch Vite project (or on a practice branch). **Only on your own computer, only on your own code.**

---

## Exercise 1: Does React escape it?

In `App.tsx`, render this string in two ways:

```tsx
const comment = '<b>bold?</b> <img src=x onerror="console.log(\'ran\')">';

return (
  <>
    <p>{comment}</p>
    <div dangerouslySetInnerHTML={{ __html: comment }} />
  </>
);
```

1. What does each one show on the page?
2. Open the browser console. Which one printed `ran`?
3. Why is that dangerous if `comment` came from another user?

---

## Exercise 2: Sanitize it

1. Install DOMPurify: `npm install dompurify`
2. Wrap the second example with `DOMPurify.sanitize(comment)`.
3. Compare the result with Exercise 1. What did DOMPurify remove, and what did it keep?

**Question:** If you could avoid `dangerouslySetInnerHTML` completely, why would that still be better than sanitizing?

---

## Exercise 3: The dangerous link

Create this component:

```tsx
function Website({ url }: { url: string }) {
  return <a href={url}>Visit</a>;
}
```

1. Render it with `url="https://react.dev"`, then with `url="javascript:console.log('clicked')"`.
2. Click the second link and look at the console.
3. Write a `safeUrl` function (see the lesson) that only allows `http:` and `https:`, and use it.
4. Test it with five different URLs, including a broken one like `not a url`.

---

## Exercise 4: What's in my bundle?

1. Add `VITE_API_KEY=super-secret-123` to a `.env` file in a scratch project.
2. Use it in your code: `console.log(import.meta.env.VITE_API_KEY)`.
3. Run `npm run build`, then search the files in `dist/assets/` for `super-secret-123`.
4. Explain in two sentences why this is a problem, and what the right way to use a real secret is.

---

## Exercise 5: Hide the button, not the data

You have an app where the "Delete user" button is only shown if `user.isAdmin` is true.

1. Why does hiding the button not protect the delete action?
2. Open DevTools → Network on any site you use and find one `fetch` request. How could someone repeat it without using the page's UI?
3. Write, in plain language, what the **server** should check before deleting a user.

---

## Exercise 6: Audit your dependencies

In your Lesson 01 or 02 project:

```bash
npm audit
```

1. How many vulnerabilities does it report, and at what severity?
2. Pick one and read its description. Is it in a package you use directly or a nested one?
3. Does `npm audit fix` solve it? (Read what it will change before you accept anything.)

---

## Exercise 7: Fail closed

What's wrong with this code, from a security point of view?

```tsx
async function canEdit(noteId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/notes/${noteId}/permissions`);
    const data = await res.json();
    return data.canEdit;
  } catch {
    return true;
  }
}
```

Rewrite it so that an error means no access.

---

## Exercise 8: Threat model a feature

Pick a feature from one of your lesson projects (comments, login, a shopping cart, a profile editor) and fill in the five questions from the lesson (Section 6). Keep it to half a page.

---

## Check yourself

- Why is "the browser is untrusted" the most important idea in frontend security?
- Name three ways XSS can still happen in a React app.
- Why must secrets never go in `VITE_*` variables?
- What's the difference between authentication and authorization?
- What does "fail closed" mean?
- What do you need before running a scanner against a website?
