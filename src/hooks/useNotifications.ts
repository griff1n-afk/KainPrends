import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string;
  recipe_id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  actor: { username: string; avatar_url: string | null };
  recipe: { title: string };
}

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
    if (!userId) {
        setNotifications([]);
        return;
    }

    async function fetchNotifications(uid: string) {
        const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:profiles!actor_id(username, avatar_url), recipe:recipes!recipe_id(title)')
        .eq('recipient_id', uid)
        .order('created_at', { ascending: false });

        if (error) {
        console.error('Error fetching notifications:', error.message);
        } else {
        setNotifications(data as Notification[]);
        }
    }

    fetchNotifications(userId);

    }, [userId]);

    const markAllAsRead = async () => {
        if (!userId) return;

        const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length === 0) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
    if (!userId) return;

    const channel = supabase
        .channel('notifications-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `recipient_id=eq.${userId}`,
            },
            async (payload) => {
                if (payload.eventType === 'INSERT') {
                const { data } = await supabase
                    .from('notifications')
                    .select('*, actor:profiles!actor_id(username, avatar_url), recipe:recipes!recipe_id(title)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setNotifications((prev) => [data as Notification, ...prev]);
                }
                } else if (payload.eventType === 'UPDATE') {
                const { data } = await supabase
                    .from('notifications')
                    .select('*, actor:profiles!actor_id(username, avatar_url), recipe:recipes!recipe_id(title)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    setNotifications((prev) => {
                    const updated = data as Notification;
                    const withoutOld = prev.filter((n) => n.id !== updated.id);
                    return [updated, ...withoutOld];
                    });
                }
                }
            }
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { notifications, markAllAsRead, unreadCount  };
}