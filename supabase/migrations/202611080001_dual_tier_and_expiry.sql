-- Migration: Dual-Tier (Annual Pass vs. Lifetime Pro) & Expiry Tracking Engine
-- Date: 2026-11-08

ALTER TABLE public.licenses 
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'annual',
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS max_devices INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_renewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_licenses_email_status ON public.licenses(email, status);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE public.razorpay_payments
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'annual';

CREATE OR REPLACE FUNCTION public.activate_razorpay_license(
  p_email TEXT,
  p_payment_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'INR',
  p_plan TEXT DEFAULT 'annual'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_email TEXT := LOWER(TRIM(p_email));
  v_clean_pid TEXT := TRIM(p_payment_id);
  v_curr TEXT := UPPER(TRIM(COALESCE(p_currency, 'INR')));
  v_plan TEXT := LOWER(TRIM(COALESCE(p_plan, 'annual')));
  v_existing RECORD;
  v_new_expiry TIMESTAMPTZ;
  v_max_devs INT;
BEGIN
  IF v_clean_email IS NULL OR v_clean_email = '' OR POSITION('@' IN v_clean_email) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email address provided.');
  END IF;

  IF v_clean_pid IS NULL OR NOT (v_clean_pid LIKE 'pay_%') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid payment identifier.');
  END IF;

  IF v_plan = 'annual' AND (
    (v_curr = 'INR' AND p_amount >= 900) OR
    (v_curr = 'USD' AND p_amount >= 25) OR
    (v_curr = 'AED' AND p_amount >= 100) OR
    (v_curr = 'SAR' AND p_amount >= 100)
  ) THEN
    v_plan := 'lifetime';
  END IF;

  IF v_plan = 'lifetime' THEN
    v_max_devs := 2;
    v_new_expiry := NULL;
  ELSE
    v_plan := 'annual';
    v_max_devs := 1;
    
    SELECT * INTO v_existing FROM public.licenses WHERE email = v_clean_email;
    
    IF v_existing.expires_at IS NOT NULL AND v_existing.expires_at > now() THEN
      v_new_expiry := v_existing.expires_at + INTERVAL '1 year';
    ELSE
      v_new_expiry := now() + INTERVAL '1 year';
    END IF;
  END IF;

  INSERT INTO public.razorpay_payments (payment_id, email, amount, currency, plan, status)
  VALUES (v_clean_pid, v_clean_email, p_amount, v_curr, v_plan, 'captured')
  ON CONFLICT (payment_id) DO NOTHING;

  INSERT INTO public.licenses (
    email, customer_name, plan, status, starts_at, expires_at, max_devices, last_renewed_at
  )
  VALUES (
    v_clean_email, split_part(v_clean_email, '@', 1), v_plan, 'active', now(), v_new_expiry, v_max_devs, now()
  )
  ON CONFLICT (email) DO UPDATE SET
    plan = v_plan,
    status = 'active',
    expires_at = v_new_expiry,
    max_devices = v_max_devs,
    last_renewed_at = now(),
    renewal_reminder_sent_at = NULL;

  RETURN jsonb_build_object(
    'success', true,
    'email', v_clean_email,
    'plan', v_plan,
    'expires_at', v_new_expiry,
    'max_devices', v_max_devs,
    'payment_id', v_clean_pid,
    'status', 'active'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_razorpay_license(TEXT, TEXT, NUMERIC, TEXT, TEXT) TO anon, authenticated, service_role;
