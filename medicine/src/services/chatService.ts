
import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export const ChatService = {
    // Get chat history for the current user
    async getHistory(): Promise<ChatMessage[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching chat history:', error);
            throw error;
        }

        return data.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.is_bot ? 'bot' : 'user',
            timestamp: new Date(msg.created_at),
        }));
    },

    // Send a message (save to DB)
    async sendMessage(text: string, isBot: boolean = false): Promise<ChatMessage | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('chat_history')
            .insert({
                user_id: user.id,
                message: text,
                is_bot: isBot,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            throw error;
        }

        return {
            id: data.id,
            text: data.message,
            sender: data.is_bot ? 'bot' : 'user',
            timestamp: new Date(data.created_at),
        };
    },

    // Clear history (optional, good for testing)
    async clearHistory() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('chat_history').delete().eq('user_id', user.id);
    }
};
