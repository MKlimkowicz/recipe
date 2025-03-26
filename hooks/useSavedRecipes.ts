import { useState, useEffect } from 'react';
// We'll use a simple in-memory store for now
// import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedRecipe {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

// In-memory storage as a fallback
const memoryStorage: Record<string, SavedRecipe[]> = {
  'saved_recipes': []
};

const STORAGE_KEY = 'saved_recipes';

export function useSavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved recipes on init
  useEffect(() => {
    loadSavedRecipes();
  }, []);

  // Load saved recipes from memory storage
  const loadSavedRecipes = async () => {
    try {
      setLoading(true);
      // We're using memory storage until AsyncStorage is properly linked
      const recipes = memoryStorage[STORAGE_KEY] || [];
      setSavedRecipes(recipes);
      setError(null);
    } catch (err) {
      setError('Failed to load saved recipes');
      console.error('Failed to load saved recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save recipes to memory storage
  const persistRecipes = async (recipes: SavedRecipe[]) => {
    try {
      // Store in memory
      memoryStorage[STORAGE_KEY] = recipes;
    } catch (err) {
      console.error('Failed to save recipes to storage:', err);
    }
  };

  // Add a new recipe to saved recipes
  const saveRecipe = async (name: string, content: string) => {
    try {
      const newRecipe: SavedRecipe = {
        id: Date.now().toString(),
        name,
        content,
        createdAt: Date.now(),
      };
      
      const updatedRecipes = [...savedRecipes, newRecipe];
      setSavedRecipes(updatedRecipes);
      await persistRecipes(updatedRecipes);
      return true;
    } catch (err) {
      setError('Failed to save recipe');
      console.error('Failed to save recipe:', err);
      return false;
    }
  };

  // Remove a recipe from saved recipes
  const removeRecipe = async (id: string) => {
    try {
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== id);
      setSavedRecipes(updatedRecipes);
      await persistRecipes(updatedRecipes);
      return true;
    } catch (err) {
      setError('Failed to remove recipe');
      console.error('Failed to remove recipe:', err);
      return false;
    }
  };

  return {
    savedRecipes,
    loading,
    error,
    saveRecipe,
    removeRecipe,
    loadSavedRecipes,
  };
} 