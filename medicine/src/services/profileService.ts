import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    blood_type?: string;
    has_wearable?: boolean;
    wearable_type?: string;
    medical_history?: string[];
    chronic_conditions?: string[];
    medications?: string[];
    allergies?: string[];
    emergency_contact?: any;
    notifications?: any;
    privacy?: any;
    subscription_tier?: 'free' | 'pro' | 'elite';
    subscription_status?: 'active' | 'expired' | 'trialing';
}

export const ProfileService = {
    async getProfile(): Promise<Profile | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    async updateProfile(updates: Partial<Profile>): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async exportData(): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch everything related to the user
        const [profile, metrics, reports, chat] = await Promise.all([
            this.getProfile(),
            supabase.from('health_metrics').select('*').eq('user_id', user.id),
            supabase.from('reports').select('*').eq('user_id', user.id),
            supabase.from('chat_history').select('*').eq('user_id', user.id)
        ]);

        return {
            export_date: new Date().toISOString(),
            user_id: user.id,
            profile: profile,
            health_metrics: metrics.data || [],
            reports: reports.data || [],
            chat_history: chat.data || []
        };
    },

    async deleteProfileData(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Delete from all tables we have access to
        const tables = ['chat_history', 'reports', 'health_metrics', 'profiles'];

        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq(table === 'profiles' ? 'id' : 'user_id', user.id);

            if (error) {
                console.error(`Error deleting from ${table}:`, error);
                // Continue to next table even if one fails
            }
        }
    },

    async getLoginActivity(): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('login_activity')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching login activity:', error);
            return [];
        }

        return data || [];
    }
};
