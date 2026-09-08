-- Correction Supabase pour la photo de profil.
-- Réutilise le bucket "pharmacampus-images" (déjà créé mais jusqu'ici inutilisé et sans policies).
-- Idempotent : peut être rejoué sans risque.

-- 1) Rendre le bucket public pour que les photos de profil s'affichent directement
--    via une URL publique (getPublicUrl), comme pour les autres champs "photo_url"
--    déjà lisibles par tous (policy "Users can view profiles").
update storage.buckets set public = true where id = 'pharmacampus-images';

-- 2) Lecture : tout le monde peut voir les photos de profil (cohérent avec la table profiles).
drop policy if exists "Anyone can view profile photos" on storage.objects;
create policy "Anyone can view profile photos" on storage.objects
for select using (bucket_id = 'pharmacampus-images');

-- 3) Écriture : chaque utilisateur ne peut déposer que dans son propre dossier
--    (chemin attendu : "<user_id>/avatar-....jpg", généré côté frontend).
drop policy if exists "Users can upload their own profile photo" on storage.objects;
create policy "Users can upload their own profile photo" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'pharmacampus-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own profile photo" on storage.objects;
create policy "Users can update their own profile photo" on storage.objects
for update to authenticated
using (
  bucket_id = 'pharmacampus-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'pharmacampus-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own profile photo" on storage.objects;
create policy "Users can delete their own profile photo" on storage.objects
for delete to authenticated
using (
  bucket_id = 'pharmacampus-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
