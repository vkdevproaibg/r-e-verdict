
ALTER FUNCTION public.current_agent_id() SECURITY INVOKER;
ALTER FUNCTION public.agent_has_active_subscription(uuid) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.current_agent_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.agent_has_active_subscription(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_agent_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.agent_has_active_subscription(uuid) TO authenticated, service_role;
