-- ============================================================
-- REVOX — Storage bucket for Business Knowledge file uploads
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- (You can also create the bucket via Dashboard > Storage > New bucket
-- named "knowledge" instead of running this file.)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('knowledge', 'knowledge', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload knowledge files"
  on storage.objects for insert
  with check (bucket_id = 'knowledge' and auth.role() = 'authenticated');

create policy "Authenticated users can read knowledge files"
  on storage.objects for select
  using (bucket_id = 'knowledge' and auth.role() = 'authenticated');

create policy "Authenticated users can delete knowledge files"
  on storage.objects for delete
  using (bucket_id = 'knowledge' and auth.role() = 'authenticated');
