import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

/**
 * Authentication context provider
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────
  // Fetch or create profile – tries to use Google data when available
  // ────────────────────────────────────────────────
  const fetchOrCreateProfile = async (userId) => {
    if (!userId) return;

    console.log('[Auth] Loading profile for user:', userId);

    try {
      // 1. Try to fetch existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // ← better than .single() when we expect 0 or 1 row

      if (data) {
        console.log('[Auth] Found existing profile');
        setProfile(data);
        return;
      }

      if (error && error.code !== 'PGRST116') {
        throw error; // real error, not just "no rows"
      }

      // 2. No profile exists → create one
      console.log('[Auth] Creating new profile');

      const defaultProfile = {
        id: userId,
        full_name:
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split('@')[0] ||
          'New User',
        avatar_url: user?.user_metadata?.avatar_url || null,
        // phone_number: null,    // leave null – user should fill it later
        // location: null,
        updated_at: new Date().toISOString(),
      };

      ({ data, error } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single());

      if (error) throw error;

      console.log('[Auth] New profile created:', data.full_name);
      setProfile(data);
    } catch (err) {
      console.error('[Auth] Profile fetch/create failed:', err.message);
      setProfile(null);
    }
  };

  // ────────────────────────────────────────────────
  // Auth initialization + listener
  // ────────────────────────────────────────────────
  useEffect(() => {
    // 1. Load initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[Auth] Initial session check:', session ? 'found' : 'none');

      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchOrCreateProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }).catch((err) => {
      console.error('[Auth] getSession failed:', err);
      setLoading(false);
    });

    // 2. Listen for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth event:', event, session?.user?.id || 'no user');

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchOrCreateProfile(session.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ────────────────────────────────────────────────
  // Sign in with Google
  // ────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/complete-profile', // ← suggest redirect after first login
        },
      });
      if (error) throw error;
      // Redirect happens automatically — no need to setLoading(false) here
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Sign out – with small delay for better UX
  // ────────────────────────────────────────────────
  const signOut = async () => {
    console.log('[AuthContext] signOut started');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('[AuthContext] Supabase signOut had warning:', error);
      }

      setUser(null);
      setProfile(null);

      // Small delay helps React Router / UI update smoothly
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error('[AuthContext] signOut exception:', err);
    } finally {
      setLoading(false);
      console.log('[AuthContext] signOut completed');
    }
  };

  // ────────────────────────────────────────────────
  // Update profile & refresh
  // ────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user?.id) {
      console.warn('[Auth] Cannot update profile: no user logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh local state
      await fetchOrCreateProfile(user.id);
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

  // ────────────────────────────────────────────────
  // Render: show loader while initializing / restoring session
  // ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-medium text-gray-700 mb-2">
          Restoring your session...
        </h2>
        <p className="text-gray-500 text-sm max-w-md text-center px-6">
          Loading your profile and marketplace data. Please wait a moment.
        </p>
      </div>
    );
  }

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