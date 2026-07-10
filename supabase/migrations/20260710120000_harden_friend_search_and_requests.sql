-- Safer profile search for friend discovery. RLS on profiles still applies.
CREATE OR REPLACE FUNCTION public.search_profiles(search_query text)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
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

GRANT EXECUTE ON FUNCTION public.search_profiles(text) TO authenticated;

-- Allow declined requests to be retried while preventing duplicate active relationships.
ALTER TABLE public.friend_requests
  DROP CONSTRAINT IF EXISTS friend_requests_requester_id_receiver_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS friend_requests_unique_active_pair
  ON public.friend_requests (
    (LEAST(requester_id, receiver_id)),
    (GREATEST(requester_id, receiver_id))
  )
  WHERE status IN ('pending', 'accepted');
