import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage';

export const useFavorites = () => {
  const { favorites, setFavorites } = useApp();

  const isFavorite = useCallback((affirmationId) => {
    return favorites.some(f => f.affirmationId === affirmationId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (affirmationId) => {
    const isCurrentlyFavorite = isFavorite(affirmationId);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      await storageService.removeFavorite(affirmationId);
      setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId));
    } else {
      // Add to favorites
      const newFavorite = await storageService.saveFavorite(affirmationId);
      setFavorites(prev => [...prev, newFavorite]);
    }

    return !isCurrentlyFavorite;
  }, [isFavorite, setFavorites]);

  const getFavoriteAffirmations = useCallback(() => {
    return favorites.map(f => f.affirmationId);
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoriteAffirmations,
    favoritesCount: favorites.length,
  };
};
