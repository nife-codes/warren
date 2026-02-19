# Warren 🐇

**Warren** is a dark-cute case documentation social app for tracking "rabbit holes" — true crime, lore, conspiracies, and high-strangeness.

![Warren Hero](/hero-rabbit.png)

## Features

- **Document Cases**: Create detailed files on true crime, lore, or conspiracies.
- **Social Investigation**: Share cases, like, and save findings from others.
- **Rabbit Hole Styling**: A unique "dark-cute" aesthetic.
- **Supabase Backend**: Real-time data persistence and authentication.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth)
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js & npm
- A Supabase project

### Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/your-username/warren.git
    cd warren
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

## Database Schema

Run the following SQL in your Supabase SQL Editor to set up the tables:

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cases
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  summary text,
  type text not null,
  tags text[] default array[]::text[],
  content jsonb default '{}'::jsonb,
  author_id uuid references public.profiles(id) not null
);

-- Likes & Saves
create table public.likes (
  user_id uuid references public.profiles(id) not null,
  case_id uuid references public.cases(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, case_id)
);

create table public.saves (
  user_id uuid references public.profiles(id) not null,
  case_id uuid references public.cases(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, case_id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;

-- (Add policies as needed for public access and user-specific writes)
```

## License

MIT
