-- Address Supabase linter: function_search_path_mutable (security)
CREATE OR REPLACE FUNCTION public.update_garden_placements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Address Supabase linter: auth_rls_initplan (performance)
DROP POLICY IF EXISTS "Users select own placements" ON public.garden_placements;
DROP POLICY IF EXISTS "Users insert own placements" ON public.garden_placements;
DROP POLICY IF EXISTS "Users update own placements" ON public.garden_placements;
DROP POLICY IF EXISTS "Users delete own placements" ON public.garden_placements;

CREATE POLICY "Users select own placements" ON public.garden_placements
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert own placements" ON public.garden_placements
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users update own placements" ON public.garden_placements
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own placements" ON public.garden_placements
  FOR DELETE USING ((select auth.uid()) = user_id);
