-- Storage Policies for 'avatars' bucket (Public)
-- Allow anyone to view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload an avatar
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.uid() = owner );


-- Storage Policies for 'reports' bucket (Private)
-- Allow users to view their own reports
create policy "Users can view own reports."
  on storage.objects for select
  using ( bucket_id = 'reports' and auth.uid() = owner );

-- Allow users to upload reports
create policy "Users can upload reports."
  on storage.objects for insert
  with check ( bucket_id = 'reports' and auth.role() = 'authenticated' );

-- Allow users to delete their own reports
create policy "Users can delete own reports."
  on storage.objects for delete
  using ( bucket_id = 'reports' and auth.uid() = owner );
