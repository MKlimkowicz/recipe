import { useEffect } from 'react';
import { StyleSheet, ScrollView, View, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useSavedRecipes, SavedRecipe } from '@/hooks/useSavedRecipes';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';

export default function SavedScreen() {
  const { savedRecipes, loading, error, removeRecipe, loadSavedRecipes } = useSavedRecipes();
  const { isPolish } = useLanguage();
  
  useEffect(() => {
    // Refresh the list when the screen is focused
    loadSavedRecipes();
  }, []);

  const handleDeleteRecipe = (recipe: SavedRecipe) => {
    Alert.alert(
      isPolish ? 'Usunąć przepis?' : 'Delete Recipe?',
      isPolish 
        ? `Czy na pewno chcesz usunąć "${recipe.name}"?` 
        : `Are you sure you want to delete "${recipe.name}"?`,
      [
        {
          text: isPolish ? 'Anuluj' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isPolish ? 'Usuń' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeRecipe(recipe.id);
          },
        },
      ]
    );
  };

  const handleViewRecipe = (recipe: SavedRecipe) => {
    // Navigate to detail screen or show details
    Alert.alert(recipe.name, recipe.content);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">
          {isPolish ? 'Zapisane Przepisy' : 'Saved Recipes'}
        </ThemedText>
      </ThemedView>

      {loading && (
        <ThemedView style={styles.messageContainer}>
          <ThemedText>
            {isPolish ? 'Ładowanie...' : 'Loading...'}
          </ThemedText>
        </ThemedView>
      )}

      {error && (
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
        </ThemedView>
      )}

      {!loading && savedRecipes.length === 0 && (
        <ThemedView style={styles.messageContainer}>
          <ThemedText>
            {isPolish 
              ? 'Nie masz jeszcze zapisanych przepisów. Wygeneruj przepis i zapisz go!'
              : 'You have no saved recipes yet. Generate a recipe and save it!'}
          </ThemedText>
          <Pressable 
            style={styles.generateButton}
            onPress={() => router.push('/')}
          >
            <ThemedText style={styles.generateButtonText}>
              {isPolish ? 'Wygeneruj Przepis' : 'Generate Recipe'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {!loading && savedRecipes.length > 0 && (
        <ThemedView style={styles.recipesContainer}>
          {savedRecipes.map((recipe) => (
            <Pressable 
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => handleViewRecipe(recipe)}
              onLongPress={() => handleDeleteRecipe(recipe)}
            >
              <ThemedText type="defaultSemiBold" style={styles.recipeName}>
                {recipe.name}
              </ThemedText>
              <ThemedText style={styles.recipeDate}>
                {formatDate(recipe.createdAt)}
              </ThemedText>
              <View style={styles.actionsContainer}>
                <Pressable
                  style={styles.viewButton}
                  onPress={() => handleViewRecipe(recipe)}
                >
                  <ThemedText style={styles.buttonText}>
                    {isPolish ? 'Zobacz' : 'View'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRecipe(recipe)}
                >
                  <ThemedText style={styles.buttonText}>
                    {isPolish ? 'Usuń' : 'Delete'}
                  </ThemedText>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 85,
  },
  headerContainer: {
    marginBottom: 16,
  },
  messageContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  recipesContainer: {
    gap: 16,
  },
  recipeCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  recipeName: {
    fontSize: 18,
    marginBottom: 8,
  },
  recipeDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#1D3D47',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#1D3D47',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    minWidth: 200,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
  },
}); 