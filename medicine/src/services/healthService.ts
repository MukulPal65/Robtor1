
import { supabase } from '../lib/supabase';

export interface HealthMetric {
    id?: number;
    user_id?: string;
    date: string;
    steps: number;
    heart_rate: number;
    sleep_hours: number;
    blood_oxygen: number;
    created_at?: string;
}

export const HealthService = {
    // Get all metrics for the current user
    async getMetrics() {
        const { data, error } = await supabase
            .from('health_metrics')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data as HealthMetric[];
    },

    // Get metrics for the last 7 days
    async getWeeklyMetrics() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: true }) // Ascending for charts
            .limit(7);

        if (error) {
            console.error('Error fetching weekly metrics:', error);
            return [];
        }
        return data as HealthMetric[];
    },

    // Get today's metric
    async getTodayMetric() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle();

        if (error) {
            console.error('Error fetching today metric:', error);
            return null;
        }

        return data as HealthMetric | null;
    },

    // Get metrics for the last 30 days
    async getMonthlyMetrics() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', dateStr)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching monthly metrics:', error);
            return [];
        }
        return data as HealthMetric[];
    },

    // Get simple trend insights
    async getTrendInsights() {
        const weekly = await this.getWeeklyMetrics();
        if (weekly.length < 2) return null;

        const currentSteps = weekly[weekly.length - 1].steps;
        const prevSteps = weekly[weekly.length - 2].steps;
        const stepChange = prevSteps === 0 ? 0 : ((currentSteps - prevSteps) / prevSteps) * 100;

        const currentHR = weekly[weekly.length - 1].heart_rate;
        const prevHR = weekly[weekly.length - 2].heart_rate;
        const hrChange = prevHR === 0 ? 0 : ((currentHR - prevHR) / prevHR) * 100;

        return {
            stepChange: Math.round(stepChange),
            hrChange: Math.round(hrChange),
            status: stepChange > 0 ? 'improving' : 'declining'
        };
    },

    // Add or update today's metric
    async upsertMetric(metric: Partial<HealthMetric>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const today = new Date().toISOString().split('T')[0];

        // First try to select to see if it exists
        const existing = await this.getTodayMetric();

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('health_metrics')
                .update({ ...metric }) // Update only passed fields
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            // Insert
            // Need to fill defaults if creating new
            const newMetric = {
                user_id: user.id,
                date: today,
                steps: 0,
                heart_rate: 70,
                sleep_hours: 0,
                blood_oxygen: 98,
                ...metric
            };

            const { data, error } = await supabase
                .from('health_metrics')
                .insert(newMetric)
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },

    // Helper to generate some dummy data for the last 7 days (for demo purposes)
    async seedDemoData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date();

        const metrics = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            metrics.push({
                user_id: user.id,
                date: dateStr,
                steps: Math.floor(Math.random() * 5000) + 5000,
                heart_rate: Math.floor(Math.random() * 20) + 60,
                sleep_hours: Math.floor(Math.random() * 4) + 5,
                blood_oxygen: Math.floor(Math.random() * 5) + 95,
            });
        }

        const { error } = await supabase.from('health_metrics').upsert(metrics, { onConflict: 'user_id,date' });
        if (error) console.error("Error seeding data:", error);
    }
};
