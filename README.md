# Warren

A dark-themed platform for documenting mysteries, true crime, lore, conspiracies, paranormal events, historical secrets, research, and world building. Think of it as a case-filing system for the unexplained.

---

## What it is

Warren lets you open case files on anything worth investigating. Each case type has its own structured format — victims, suspects, evidence, timelines, creep ratings, source links — so nothing gets lost in a wall of text. Cases can be public or kept private. The community can read, react, annotate, and comment on anything you share.

---

## Features

- **8 case types** — True Crime, Lore/Urban Legend, Conspiracy, Missing Persons, Paranormal, Historical, Research, World Building
- **Structured case files** — each type has purpose-built fields: people entries, evidence lists, chip selectors, image uploads, ratings, and more
- **Highlight & react** — select any text on a case to react with an emoji or leave an annotated comment anchored to that passage
- **Comments & replies** — threaded comments with likes, author tags, and delete
- **Like & save** — like cases and bookmark them to your Saved tab in My Warren
- **My Warren** — your personal library with tabs for your own cases and saved cases
- **Feed** — browse all public cases, filter by type, search by title or tag
- **People search** — find and visit other users' profiles
- **User profiles** — avatar, display name, pronouns, bio, case count, follower count, follow button
- **Draft auto-save** — new cases save to local storage as you type and reload if you leave mid-way
- **Founder badge** — a unique Warren logo badge on the founder's profile with a hover/tap tooltip
- **Bug reporting** — in-app form that submits directly to the database, no email client needed
- **Demo account support** — accounts flagged as demo are read-only; interactions redirect to sign in
- **Docs** — full in-app documentation with sidebar navigation and section tracking

---

## Tech

- **React + TypeScript + Vite**
- **Tailwind CSS** with custom dark theme
- **Supabase** — auth, database, storage, RLS
- **React Router v6**
- **shadcn/ui** component library
- **Lucide** icons

---

## Database tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles — username, avatar, bio, pronouns, is_founder, is_demo |
| `cases` | Case files — title, summary, type, fields (JSONB), tags, is_public |
| `comments` | Comments and reactions on cases |
| `comment_likes` | Likes on individual comments |
| `case_likes` | Likes on cases |
| `case_saves` | Saved/bookmarked cases |
| `follows` | Follow relationships between users |
| `bug_reports` | In-app bug reports |

---

## Running locally

```bash
npm install
npm run dev
```

Requires a Supabase project. Add your credentials to the environment.

---

Built by [@nife-codes](https://github.com/nife-codes)
