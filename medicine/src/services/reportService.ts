import { supabase } from '../lib/supabase';

export interface Report {
    id: number;
    user_id: string;
    file_name: string;
    file_url: string;
    analysis_result: any;
    created_at: string;
}

export const ReportService = {
    async getLatestReport(): Promise<Report | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('Error fetching latest report:', error);
            return null;
        }

        return data as Report;
    }
};
