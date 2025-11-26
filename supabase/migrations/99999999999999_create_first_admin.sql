-- Admin User Setup Migration
-- Created: 2025-11-18
-- Description: Creates functions to promote users to admin role

-- Function to promote a user to admin role by email
-- This function can only be called by the service role (database admin)
-- Usage: SELECT make_user_admin('matt@yourmateagency.com.au');

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  role TEXT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  existing_profile RECORD;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE auth.users.email = user_email
  LIMIT 1;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT
      NULL::UUID as user_id,
      user_email as email,
      NULL::TEXT as role,
      FALSE as success,
      'User not found with email: ' || user_email as message;
    RETURN;
  END IF;

  -- Check if user_profile already exists
  SELECT * INTO existing_profile
  FROM user_profiles
  WHERE id = target_user_id;

  -- If profile exists, update the role
  IF existing_profile IS NOT NULL THEN
    UPDATE user_profiles
    SET
      role = 'admin',
      updated_at = NOW()
    WHERE id = target_user_id;

    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      'admin'::TEXT as role,
      TRUE as success,
      'User role updated to admin successfully' as message;
  ELSE
    -- If profile doesn't exist, create one with admin role
    INSERT INTO user_profiles (id, email, role, created_at, updated_at)
    VALUES (
      target_user_id,
      user_email,
      'admin',
      NOW(),
      NOW()
    );

    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      'admin'::TEXT as role,
      TRUE as success,
      'User profile created with admin role' as message;
  END IF;

  -- Log the promotion
  RAISE NOTICE 'User % (ID: %) has been promoted to admin', user_email, target_user_id;

EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      NULL::TEXT as role,
      FALSE as success,
      'Error promoting user: ' || SQLERRM as message;
END;
$$;

-- Function to list all admin users
-- Usage: SELECT * FROM list_admin_users();

CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    up.id as user_id,
    up.email,
    up.role,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.role = 'admin'
  ORDER BY up.created_at ASC;
$$;

-- Function to demote admin user to regular user
-- Usage: SELECT demote_admin('user@example.com');

CREATE OR REPLACE FUNCTION demote_admin(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  role TEXT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = user_email
  LIMIT 1;

  -- Check if user exists
  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT
      NULL::UUID as user_id,
      user_email as email,
      NULL::TEXT as role,
      FALSE as success,
      'User not found with email: ' || user_email as message;
    RETURN;
  END IF;

  -- Update the user role to regular user
  UPDATE user_profiles
  SET
    role = 'user',
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Check if update was successful
  IF FOUND THEN
    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      'user'::TEXT as role,
      TRUE as success,
      'User role changed to regular user' as message;

    RAISE NOTICE 'User % (ID: %) has been demoted to regular user', user_email, target_user_id;
  ELSE
    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      NULL::TEXT as role,
      FALSE as success,
      'User profile not found or already a regular user' as message;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT
      target_user_id as user_id,
      user_email as email,
      NULL::TEXT as role,
      FALSE as success,
      'Error demoting user: ' || SQLERRM as message;
END;
$$;

-- Function to check if a user is an admin
-- Usage: SELECT is_user_admin('user@example.com');

CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM user_profiles up
    JOIN auth.users au ON au.id = up.id
    WHERE au.email = user_email
    AND up.role = 'admin'
  );
$$;

-- Grant execute permissions to authenticated users for read-only functions
GRANT EXECUTE ON FUNCTION list_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO authenticated;

-- Restrict admin management functions to service role only
-- These functions should only be called by database admins or through secure server-side code
REVOKE EXECUTE ON FUNCTION make_user_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION demote_admin(TEXT) FROM PUBLIC;

-- Example usage (commented out - uncomment and modify as needed):
--
-- -- Promote a user to admin (run this after they sign up)
-- SELECT make_user_admin('matt@yourmateagency.com.au');
--
-- -- List all admin users
-- SELECT * FROM list_admin_users();
--
-- -- Check if a user is admin
-- SELECT is_user_admin('matt@yourmateagency.com.au');
--
-- -- Demote an admin user (if needed)
-- SELECT demote_admin('user@example.com');

-- Add comment to track this migration
COMMENT ON FUNCTION make_user_admin(TEXT) IS 'Promotes a user to admin role by email. Only accessible to service role.';
COMMENT ON FUNCTION list_admin_users() IS 'Lists all users with admin role. Accessible to authenticated users.';
COMMENT ON FUNCTION demote_admin(TEXT) IS 'Demotes an admin user to regular user role. Only accessible to service role.';
COMMENT ON FUNCTION is_user_admin(TEXT) IS 'Checks if a user has admin role by email. Accessible to authenticated users.';