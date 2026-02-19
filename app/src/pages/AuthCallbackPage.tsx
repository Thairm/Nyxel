import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles } from 'lucide-react';

export default function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase will handle the token exchange automatically
        // We just need to wait for the session to be established
        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                navigate('/auth');
                return;
            }

            if (session) {
                // Successfully logged in — go to hub
                navigate('/home');
            } else {
                // No session yet, wait for auth state change
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    (_event, session) => {
                        if (session) {
                            subscription.unsubscribe();
                            navigate('/home');
                        }
                    }
                );

                // Timeout fallback — if nothing happens in 5s, redirect to auth
                setTimeout(() => {
                    subscription.unsubscribe();
                    navigate('/auth');
                }, 5000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
                <p className="text-gray-400 text-sm">Please wait while we complete authentication.</p>
            </div>
        </div>
    );
}
