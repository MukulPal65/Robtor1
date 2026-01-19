
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [sessionUser, setSessionUser] = useState<string | null>(null);

    useEffect(() => {
        async function checkConnection() {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    throw error;
                }
                setSessionUser(data.session?.user.email || 'No active session (Public access ok)');
                setStatus('connected');
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(err.message || 'Failed to connect');
                console.error('Supabase connection error:', err);
            }
        }

        checkConnection();
    }, []);

    if (status === 'loading') return <div className="p-4 bg-gray-100 rounded">Connecting to Supabase...</div>;
    if (status === 'error') return <div className="p-4 bg-red-100 text-red-700 rounded">Error: {errorMsg}</div>;

    return (
        <div className="p-4 bg-green-100 text-green-800 rounded border border-green-300 my-4">
            <h3 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Supabase Connected Successfully
            </h3>
            <p className="text-sm mt-1">{sessionUser}</p>
        </div>
    );
}
