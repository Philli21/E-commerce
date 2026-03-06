// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isInitialized = useRef(false);
  const isFetchingProfile = useRef(false);

  const fetchOrCreateProfile = useCallback(async (userId, userData = null) => {
    if (!userId || isFetchingProfile.current) return;
    isFetchingProfile.current = true;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
        return;
      }

      if (error && error.code !== 'PGRST116') throw error;

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

      if (insertError) throw insertError;

      setProfile(created);
    } catch (err) {
      console.error('Profile fetch/create error:', err);
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    const initializeAuth = async () => {
      if (isInitialized.current) return;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          await fetchOrCreateProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitialized.current = true;
        }
      }
    };

    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (event === 'INITIAL_SESSION') return;
        if (session?.user) {
          setUser(session.user);
          await fetchOrCreateProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    subscription = sub;
    initializeAuth();

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/complete-profile',
          prompt: 'select_account', // 🔥 forces account chooser every time
        },
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;
    try {
      await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      await fetchOrCreateProfile(user.id);
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    }
  }, [user, fetchOrCreateProfile]);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  }), [user, profile, loading, signInWithGoogle, signOut, updateProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-xl font-medium text-gray-700 mb-2">Restoring your session...</h2>
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};