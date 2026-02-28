import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

/**
 * Provides authentication state and methods.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('[Auth] getSession error:', err);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth event:', event, session?.user?.id || 'no user');

        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            await fetchProfile(session.user.id);
          } catch (err) {
            console.error('[Auth] Profile fetch failed after auth change:', err);
          } finally {
            setLoading(false);
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Fetch user profile from the 'profiles' table.
   * @param {string} userId
   * @returns {Promise<void>}
   */
  const fetchProfile = async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[Auth] Profile fetch warning:', error.message);
        // You might want to setProfile(null) here or handle "profile not found"
        setProfile(null);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('[Auth] Unexpected error fetching profile:', err);
      setProfile(null);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Page will redirect — no need to setLoading(false) here
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
      setLoading(false);
    }
  };

 const signOut = async () => {
  console.log('[Auth] signOut called');
  setLoading(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] signOut error:', error);
      setLoading(false);
      throw error;
    }
    console.log('[Auth] signOut successful');
    setUser(null);
    setProfile(null);
    setLoading(false);
  } catch (err) {
    console.error('[Auth] signOut exception:', err);
    setLoading(false);
    throw err;
  }
};

  /**
   * Update profile fields and refresh local state
   * @param {Object} updates
   */
  const updateProfile = async (updates) => {
    if (!user?.id) {
      console.warn('[Auth] Cannot update profile: no user logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh local profile
      await fetchProfile(user.id);
    } catch (err) {
      console.error('[Auth] Profile update failed:', err);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};