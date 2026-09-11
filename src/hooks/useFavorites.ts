import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useFavorites(userId: string | null) {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setFavoritedIds(new Set());
      return;
    }

    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', userId);

      setFavoritedIds(new Set((data ?? []).map((f) => f.recipe_id)));
    };

    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (recipeId: string, newState: boolean) => {
    if (!userId) return;

    setFavoritedIds((prev) => {
      const updated = new Set(prev);
      if (newState) {
        updated.add(recipeId);
      } else {
        updated.delete(recipeId);
      }
      return updated;
    });

    if (newState) {
      await supabase.from('favorites').insert({ user_id: userId, recipe_id: recipeId });

      const { data: recipeData } = await supabase
        .from('recipes')
        .select('user_id')
        .eq('id', recipeId)
        .single();

      if (recipeData && recipeData.user_id !== userId) {
        await supabase.from('notifications').upsert(
          {
            recipient_id: recipeData.user_id,
            actor_id: userId,
            recipe_id: recipeId,
            type: 'favorite',
            is_read: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'recipient_id,actor_id,recipe_id,type' }
        );
      }
    } else {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    }
  };

  return { favoritedIds, toggleFavorite };
}