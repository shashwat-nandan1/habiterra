-- Remove broad direct profile search access; users can still read their own profile.
DROP POLICY IF EXISTS "Authenticated can search profiles" ON public.profiles;

-- Profile search is available only through this limited SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.search_profiles(search_query text)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.email, p.avatar_url
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND length(trim(search_query)) >= 2
    AND (
      p.full_name ILIKE ('%' || replace(replace(replace(trim(search_query), '\\', '\\\\'), '%', '\%'), '_', '\_') || '%') ESCAPE '\'
      OR p.email ILIKE ('%' || replace(replace(replace(trim(search_query), '\\', '\\\\'), '%', '\%'), '_', '\_') || '%') ESCAPE '\'
    )
  ORDER BY p.full_name NULLS LAST, p.email
  LIMIT 10;
$$;

REVOKE ALL ON FUNCTION public.search_profiles(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated;
