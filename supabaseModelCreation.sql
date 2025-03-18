-- Create profiles table
create table profiles (
    user_id uuid primary key references auth.users(id),
    username text unique,
    subscription_status text check (subscription_status in ('free', 'pro', 'enterprise')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stories table
create table stories (
    story_id uuid primary key,
    user_id uuid references profiles(user_id),
    title text,
    content text,
    prompt text,
    stats jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_public boolean default false
);

-- Create subscriptions table
create table subscriptions (
    subscription_id uuid primary key,
    user_id uuid references profiles(user_id),
    status text check (status in ('active', 'canceled', 'expired')),
    plan text check (plan in ('free', 'pro_monthly', 'pro_annual')),
    start_date timestamp with time zone,
    end_date timestamp with time zone
);

-- Create prompts table (optional)
create table prompts (
    prompt_id uuid primary key,
    user_id uuid references profiles(user_id),
    text text,
    tags jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (user_id, username, subscription_status)
    values (new.id, new.email, 'free');
    return new;
end;
$$;

-- Create a trigger to call the function when a new user is created
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();