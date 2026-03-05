import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to track if we've already initialized to prevent race conditions
  const isInitialized = useRef(false);
  const isFetchingProfile = useRef(false);

  console.log('🔵 [AUTH] AuthProvider render', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    isInitialized: isInitialized.current,
    timestamp: new Date().toISOString()
  });

  // ────────────────────────────────────────────────
  // Fetch or create profile - with deduplication
  // ────────────────────────────────────────────────
  const fetchOrCreateProfile = async (userId, userData = null) => {
    if (!userId) {
      console.log('🔴 [AUTH] fetchOrCreateProfile ABORTED - no userId');
      return;
    }
    
    // Prevent concurrent profile fetches
    if (isFetchingProfile.current) {
      console.log('🟡 [AUTH] fetchOrCreateProfile SKIPPED - already fetching');
      return;
    }
    
    isFetchingProfile.current = true;
    console.log('🟢 [AUTH] fetchOrCreateProfile STARTED', { userId });

    try {
      // 1. Fetch existing profile from profiles table
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('🟡 [AUTH] Profile fetch result', {
        hasData: !!data,
        hasError: !!error,
        fullName: data?.full_name
      });

      if (data) {
        console.log('✅ [AUTH] Profile FOUND:', data.full_name);
        setProfile(data);
        return;
      }

      if (error && error.code !== 'PGRST116') {
        console.log('🔴 [AUTH] Profile fetch ERROR:', error);
        throw error;
      }

      // 2. No profile exists → create one
      console.log('🟡 [AUTH] Creating new profile...');

      const name = userData?.user_metadata?.full_name ||
                   userData?.user_metadata?.name ||
                   userData?.email?.split('@')[0] ||
                   'User';

      const avatar = userData?.user_metadata?.avatar_url || null;

      const newProfile = {
        id: userId,
        full_name: name,
        avatar_url: avatar,
        updated_at: new Date().toISOString(),
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (insertError) {
        console.log('🔴 [AUTH] Profile insert ERROR:', insertError);
        throw insertError;
      }

      console.log('✅ [AUTH] Profile CREATED:', created.full_name);
      setProfile(created);

    } catch (err) {
      console.log('🔴 [AUTH] fetchOrCreateProfile CAUGHT ERROR:', err.message);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
      console.log('🟢 [AUTH] fetchOrCreateProfile COMPLETED');
    }
  };

  // ────────────────────────────────────────────────
  // SINGLE useEffect for auth initialization
  // ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    console.log('🔵 [AUTH] useEffect STARTED');

    // 1. Load initial session
    const initializeAuth = async () => {
      // Prevent double initialization
      if (isInitialized.current) {
        console.log('🟡 [AUTH] initializeAuth SKIPPED - already initialized');
        return;
      }
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('🟡 [AUTH] getSession RESOLVED', {
          hasSession: !!session,
          hasError: !!error,
          userId: session?.user?.id
        });

        if (!isMounted) {
          console.log('🔴 [AUTH] Component unmounted - aborting');
          return;
        }

        if (error) {
          console.log('🔴 [AUTH] getSession ERROR:', error);
          setLoading(false);
          isInitialized.current = true;
          return;
        }

        if (session?.user) {
          console.log('✅ [AUTH] Session user found:', session.user.id);
          setUser(session.user);
          
          // Wait for profile to be fetched before setting loading to false
          await fetchOrCreateProfile(session.user.id, session.user);
        } else {
          console.log('⚪ [AUTH] No session user');
          setUser(null);
          setProfile(null);
        }

        if (isMounted) {
          console.log('🟡 [AUTH] Setting loading = false (initial)');
          setLoading(false);
          isInitialized.current = true;
        }
      } catch (err) {
        console.log('🔴 [AUTH] getSession REJECTED:', err.message);
        if (isMounted) {
          setLoading(false);
          isInitialized.current = true;
        }
      }
    };

    // 2. Listen for auth changes
    console.log('🟡 [AUTH] Setting up onAuthStateChange listener...');

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟣 [AUTH] onAuthStateChange TRIGGERED', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          isInitialized: isInitialized.current
        });

        if (!isMounted) {
          console.log('🔴 [AUTH] Component unmounted - ignoring');
          return;
        }

        // Skip INITIAL_SESSION - getSession() already handled it
        if (event === 'INITIAL_SESSION') {
          console.log('🟡 [AUTH] Skipping INITIAL_SESSION - already handled by getSession');
          return;
        }

        if (session?.user) {
          console.log('✅ [AUTH] Auth event - user present');
          setUser(session.user);
          await fetchOrCreateProfile(session.user.id, session.user);
        } else {
          console.log('⚪ [AUTH] Auth event - no user (logged out)');
          setUser(null);
          setProfile(null);
        }

        console.log('🟡 [AUTH] Setting loading = false (listener)');
        setLoading(false);
        console.log('🟣 [AUTH] Auth event handler COMPLETED');
      }
    );

    subscription = sub;
    
    // Start initialization AFTER setting up listener
    initializeAuth();

    // Cleanup
    return () => {
      console.log('🔴 [AUTH] useEffect CLEANUP running');
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
        console.log('🔴 [AUTH] Auth listener unsubscribed');
      }
      console.log('🔴 [AUTH] Cleanup COMPLETED');
    };
  }, []);

  // ────────────────────────────────────────────────
  // Sign in with Google
  // ────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    console.log('🟢 [AUTH] signInWithGoogle STARTED');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/complete-profile',
        },
      });
      if (error) throw error;
    } catch (err) {
      console.log('🔴 [AUTH] Google sign-in FAILED:', err.message);
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Sign out
  // ────────────────────────────────────────────────
  const signOut = async () => {
    console.log('🟢 [AUTH] signOut STARTED');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('⚠️ [AUTH] signOut warning:', error);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.log('🔴 [AUTH] signOut ERROR:', err.message);
    } finally {
      setLoading(false);
      console.log('🟢 [AUTH] signOut FINISHED');
    }
  };

  // ────────────────────────────────────────────────
  // Update profile
  // ────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    if (!user?.id) {
      console.log('🔴 [AUTH] updateProfile ABORTED - no user');
      return;
    }

    console.log('🟢 [AUTH] updateProfile STARTED', { updates });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      console.log('✅ [AUTH] Profile updated - refreshing...');
      await fetchOrCreateProfile(user.id);

    } catch (err) {
      console.log('🔴 [AUTH] updateProfile FAILED:', err.message);
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

  console.log('🔵 [AUTH] Context value prepared', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading
  });

  // ────────────────────────────────────────────────
  // Render loading state
  // ────────────────────────────────────────────────
  if (loading) {
    console.log('⏳ [AUTH] RENDERING LOADING SCREEN');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-medium text-gray-700 mb-2">
          Restoring your session...
        </h2>
        <p className="text-gray-500 text-sm max-w-md text-center px-6">
          Loading your profile and marketplace data. Please wait a moment.
        </p>
        <div className="mt-4 text-xs text-gray-400">
          Debug: loading={loading.toString()}, user={!!user}, profile={!!profile}
        </div>
      </div>
    );
  }

  console.log('✅ [AUTH] RENDERING CHILDREN - Auth ready');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.log('🔴 [AUTH] useAuth called outside AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('🔵 [AUTH] useAuth hook called', {
    hasUser: !!context.user,
    hasProfile: !!context.profile,
    loading: context.loading
  });
  return context;
};