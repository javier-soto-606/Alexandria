-- Create a PRIVATE Supabase Storage bucket named: library-files
-- Then run this SQL in Supabase SQL Editor.

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  description text not null default '',
  author_name text not null,
  tags text[] not null default '{}',
  original_filename text not null,
  file_type text not null check (file_type in ('pdf','zip')),
  storage_path text not null unique,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Signed-in users can view archive metadata"
on public.documents for select to authenticated using (true);

create policy "Users can add documents as themselves"
on public.documents for insert to authenticated with check (auth.uid() = owner_id);

create policy "Owners can update their metadata"
on public.documents for update to authenticated
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owners can delete their metadata"
on public.documents for delete to authenticated using (auth.uid() = owner_id);

create policy "Signed-in users can download archive files"
on storage.objects for select to authenticated
using (bucket_id = 'library-files');

create policy "Users can upload to their own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'library-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own stored files"
on storage.objects for update to authenticated
using (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own stored files"
on storage.objects for delete to authenticated
using (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text);
