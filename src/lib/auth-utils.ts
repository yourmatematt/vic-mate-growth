/**
 * Authentication Utilities
 *
 * Helper functions for authentication and role checking
 */

import { supabase } from '@/lib/supabase';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Extended user interface with profile
export interface UserWithProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
}

/**
 * Get current user with profile information
 */
export async function getCurrentUser(): Promise<UserWithProfile | null> {
  try {
    console.log('auth-utils: Getting current user...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    console.log('auth-utils: Supabase getSession result:', { user: session?.user?.email, error: sessionError });

    if (sessionError || !session?.user) {
      console.log('auth-utils: No session found or error');
      return null;
    }

    return getUserWithProfile(session.user);
  } catch (error) {
    console.error('auth-utils: Error getting current user:', error);
    return null;
  }
}

async function getUserWithProfile(user: { id: string; email?: string }): Promise<UserWithProfile | null> {
  try {
    console.log('auth-utils: Fetching user profile for:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    console.log('auth-utils: User profile query result:', { profile, error: profileError });

    if (profileError) {
      console.error('auth-utils: Error fetching user profile:', profileError);
    }

    const result = {
      id: user.id,
      email: user.email || '',
      role: (profile?.role as 'user' | 'admin') || 'user',
      isAdmin: profile?.role === 'admin'
    };

    console.log('auth-utils: Final user result:', result);
    return result;
  } catch (error) {
    console.error('auth-utils: Error getting user profile:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
}

/**
 * Create user profile after signup
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: 'user' | 'admin' = 'user'
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<UserProfile | null> {
  try {
    // Check if current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser?.isAdmin) {
      throw new Error('Only administrators can update user roles');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * List all users (admin only)
 */
export async function listUsers(): Promise<UserProfile[]> {
  try {
    // Check if current user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser?.isAdmin) {
      throw new Error('Only administrators can list users');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

/**
 * Check if user exists by email
 */
export async function userExistsByEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

/**
 * Sign up user with profile creation
 */
export async function signUpWithProfile(
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Create user profile if user was created
    if (data.user) {
      await createUserProfile(data.user.id, email, role);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error signing up user:', error);
    return { data: null, error };
  }
}

/**
 * Sign in user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    console.error('Error signing in user:', error);
    return { data: null, error };
  }
}

/**
 * Sign out user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error signing out user:', error);
    return { error };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    return { error };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error };
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    return { error };
  } catch (error) {
    console.error('Error updating password:', error);
    return { error };
  }
}

/**
 * Get session token
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

/**
 * Refresh session
 */
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { data: null, error };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: UserWithProfile | null) => void) {
  console.log('auth-utils: Setting up auth state change listener');
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('auth-utils: Auth state change event:', event, session?.user?.email);
    if (session?.user) {
      const userWithProfile = await getUserWithProfile(session.user);
      console.log('auth-utils: Calling callback with user:', userWithProfile);
      callback(userWithProfile);
    } else {
      console.log('auth-utils: Calling callback with null');
      callback(null);
    }
  });

  return { data };
}