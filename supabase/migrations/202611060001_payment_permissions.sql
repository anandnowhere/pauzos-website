-- Apply during cutover only after the verified payment function is deployed.
-- The old website RPC must no longer mint licenses from client-supplied IDs.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.activate_razorpay_license(TEXT,TEXT,NUMERIC,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_razorpay_license(TEXT,TEXT,NUMERIC,TEXT) TO service_role;
DROP POLICY IF EXISTS "Allow public read of razorpay_payments" ON public.razorpay_payments;
REVOKE ALL ON TABLE public.razorpay_payments FROM anon, authenticated;
GRANT ALL ON TABLE public.razorpay_payments TO service_role;
COMMIT;
