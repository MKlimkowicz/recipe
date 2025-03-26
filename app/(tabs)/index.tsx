import { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, ActivityIndicator, Switch, View, TextInput, Alert, Modal, Animated, ViewStyle, PressableStateCallbackType, GestureResponderEvent } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRecipeGeneration, COMMON_INGREDIENTS, INGREDIENT_CATEGORIES } from '@/hooks/useRecipeGeneration';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useLanguage } from '@/hooks/useLanguage';
import LinearGradientBase from 'react-native-linear-gradient';
import type { LinearGradientProps as BaseLinearGradientProps } from 'react-native-linear-gradient';

// Extend LinearGradientProps to ensure compatibility with React Native
interface ExtendedLinearGradientProps extends BaseLinearGradientProps {
  children?: React.ReactNode;
}

// Cast LinearGradient as a React component with the extended props
const LinearGradient = LinearGradientBase as unknown as React.ComponentType<ExtendedLinearGradientProps>;

// Define dietary component types
type DietaryComponentPreference = 'include' | 'exclude' | 'limit' | 'default';

interface DietaryComponentSetting {
  preference: DietaryComponentPreference;
  amount?: number;
}

// Create dietary component translations
const DIETARY_COMPONENTS = [
  { id: 'carbohydrates', label: { en: 'Carbohydrates', pl: 'Węglowodany' } },
  { id: 'proteins', label: { en: 'Proteins', pl: 'Białka' } },
  { id: 'fats', label: { en: 'Fats', pl: 'Tłuszcze' } },
  { id: 'sugars', label: { en: 'Sugars', pl: 'Cukry' } },
  { id: 'fiber', label: { en: 'Fiber', pl: 'Błonnik' } },
  { id: 'sodium', label: { en: 'Sodium', pl: 'Sód' } },
  { id: 'cholesterol', label: { en: 'Cholesterol', pl: 'Cholesterol' } },
];

// Export the props interface for ModernButton
export interface ModernButtonProps {
  onPress: (event: GestureResponderEvent) => void; // Update to accept GestureResponderEvent
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  disabled?: boolean;
}

// Custom Button Component with Press Animation
export const ModernButton = ({ 
  onPress, 
  children, 
  style, 
  gradientColors = ['#007bff', '#0056b3'],
  disabled = false
}: ModernButtonProps) => {
  const animatedScale = new Animated.Value(1);
  const [isFocused, setIsFocused] = useState(false);
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View 
      style={[
        modernButtonStyles.buttonContainer, 
        { transform: [{ scale: animatedScale }] },
        isFocused && modernButtonStyles.buttonFocused,
        style
      ]}
    >
      <Pressable
        onPress={onPress} // Pass the event to the onPress handler
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={disabled ? ['#cccccc', '#aaaaaa'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={modernButtonStyles.buttonPressable}
        >
          <View style={modernButtonStyles.buttonContent}>
            {children}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const modernButtonStyles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  buttonFocused: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 10,
  },
  buttonPressable: {
    width: '100%',
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});


export default function HomeScreen() {
  const [diet, setDiet] = useState<string>('');
  const [prepTime, setPrepTime] = useState<string>('any');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showIngredientPicker, setShowIngredientPicker] = useState<boolean>(false);
  const { isPolish, setIsPolish } = useLanguage();
  const [mealType, setMealType] = useState<string>('');
  const [cuisine, setCuisine] = useState<string>('');
  const [showCuisineOptions, setShowCuisineOptions] = useState<boolean>(false);
  const [ingredientSearch, setIngredientSearch] = useState<string>('');
  const [useOnlySelected, setUseOnlySelected] = useState<boolean>(false);
  const [showPrepTimeOptions, setShowPrepTimeOptions] = useState<boolean>(false);
  const [showDietOptions, setShowDietOptions] = useState<boolean>(false);
  const [showMealTypeOptions, setShowMealTypeOptions] = useState<boolean>(false);
  const [recipeCount, setRecipeCount] = useState<number>(1);
  const [showMultipleRecipes, setShowMultipleRecipes] = useState<boolean>(false);
  const [dietaryComponents, setDietaryComponents] = useState<Record<string, DietaryComponentSetting>>({
    carbohydrates: { preference: 'default' },
    proteins: { preference: 'default' },
    fats: { preference: 'default' },
    sugars: { preference: 'default' },
    fiber: { preference: 'default' },
    sodium: { preference: 'default' },
    cholesterol: { preference: 'default' },
  });
  const [showDietaryComponentsModal, setShowDietaryComponentsModal] = useState<boolean>(false);
  const { recipe, recipes, loading, error, generateRecipe, generateMultipleRecipes, toggleRecipeExpanded } = useRecipeGeneration();
  const { saveRecipe } = useSavedRecipes();

  // Filter ingredients based on search term
  const filteredIngredients = ingredientSearch.trim() === '' 
    ? COMMON_INGREDIENTS 
    : COMMON_INGREDIENTS.filter(ingredient => {
        const searchTerm = ingredientSearch.toLowerCase();
        const englishLabel = ingredient.label.en.toLowerCase();
        const polishLabel = ingredient.label.pl.toLowerCase();
        return englishLabel.includes(searchTerm) || polishLabel.includes(searchTerm);
      });
      
  // Group ingredients by category
  const getIngredientsByCategory = () => {
    const categorizedIngredients: Record<string, typeof COMMON_INGREDIENTS> = {};
    
    // Initialize categories with empty arrays
    INGREDIENT_CATEGORIES.forEach(category => {
      categorizedIngredients[category.id] = [];
    });
    
    // Add filtered ingredients to appropriate categories
    filteredIngredients.forEach(ingredient => {
      if (ingredient.category && categorizedIngredients[ingredient.category]) {
        categorizedIngredients[ingredient.category].push(ingredient);
      }
    });
    
    return categorizedIngredients;
  };

  // Get category label based on current language
  const getCategoryLabel = (categoryId: string) => {
    const category = INGREDIENT_CATEGORIES.find(c => c.id === categoryId);
    return category ? (isPolish ? category.label.pl : category.label.en) : categoryId;
  };

  const handleGenerateRecipe = async () => {
    try {
      // Reset recipes view mode when generating a new recipe
      setShowMultipleRecipes(false);
      
      // Always generate recipe using English instructions, but specify output language
      await generateRecipe({
        diet,
        prepTime,
        ingredients: selectedIngredients,
        displayLanguage: isPolish ? 'polish' : 'english', // Controls output language
        mealType,
        cuisine,
        useOnlySelected,
        dietaryComponents,
        // Add random seed to ensure different results each time
        randomSeed: Math.floor(Math.random() * 10000)
      });
    } catch (err) {
      console.error('Failed to generate recipe:', err);
    }
  };

  const handleGenerateMultipleRecipes = async () => {
    try {
      // Set view mode to multiple recipes
      setShowMultipleRecipes(true);
      
      // Generate multiple recipes
      await generateMultipleRecipes({
        diet,
        prepTime,
        ingredients: selectedIngredients,
        displayLanguage: isPolish ? 'polish' : 'english',
        mealType,
        cuisine,
        useOnlySelected,
        dietaryComponents,
      }, recipeCount);
    } catch (err) {
      console.error('Failed to generate multiple recipes:', err);
    }
  };

  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Helper function to get the ingredient label in the current language
  const getIngredientLabel = (ingredient: any) => {
    return isPolish ? ingredient.label.pl : ingredient.label.en;
  };

  // Helper function to find ingredient by value
  const findIngredientByValue = (value: string) => {
    return COMMON_INGREDIENTS.find(ingredient => ingredient.value === value);
  };

  // Helper function to display selected ingredients in the current language
  const getSelectedIngredientsText = () => {
    if (selectedIngredients.length === 0) {
      return isPolish ? 'Wybierz składniki' : 'Select ingredients';
    }
    
    const selectedLabels = selectedIngredients.map(ingredientValue => {
      const ingredient = findIngredientByValue(ingredientValue);
      return ingredient ? getIngredientLabel(ingredient) : ingredientValue;
    });
    
    return `${isPolish ? 'Wybrane' : 'Selected'}: ${selectedLabels.join(', ')}`;
  };

  // Helper function to save a specific recipe
  const handleSaveSpecificRecipe = (recipeContent: string) => {
    try {
      // Extract recipe name from content
      const lines = recipeContent.split('\n');
      const recipeName = lines.length > 0 ? lines[0].replace(/<recipe_name>\s*/, '').replace(/^###\s*/, '').trim() : 'Untitled Recipe';
      
      saveRecipe(recipeName, recipeContent);
      
      Alert.alert(
        isPolish ? 'Przepis zapisany' : 'Recipe saved',
        isPolish ? 'Przepis został zapisany i jest dostępny w zakładce "Zapisane".' : 'The recipe has been saved and is available in the "Saved" tab.'
      );
    } catch (err) {
      console.error('Failed to save recipe:', err);
      Alert.alert(
        isPolish ? 'Błąd' : 'Error',
        isPolish ? 'Nie udało się zapisać przepisu.' : 'Failed to save recipe.'
      );
    }
  };

  // Helper function for the original single recipe save
  const handleSaveRecipe = async () => {
    if (!recipe) return;
    handleSaveSpecificRecipe(recipe);
  };

  // Diet options with translations - added low glycemic index option
  const dietOptions = [
    { 
      label: isPolish ? 'Wegetariańskie' : 'Vegetarian', 
      value: 'vegetarian' 
    },
    { 
      label: isPolish ? 'Wegańskie' : 'Vegan', 
      value: 'vegan' 
    },
    { 
      label: isPolish ? 'Mięsne' : 'Meat-based', 
      value: 'meat' 
    },
    { 
      label: isPolish ? 'Niski indeks glikemiczny' : 'Low Glycemic Index', 
      value: 'low_gi' 
    }
  ];

  // Preparation time options with translations
  const prepTimeOptions = [
    { 
      label: isPolish ? 'Dowolny czas' : 'Any time', 
      value: 'any' 
    },
    { 
      label: isPolish ? 'Szybko (< 20 min)' : 'Quick (< 20 mins)', 
      value: 'quick' 
    },
    { 
      label: isPolish ? 'Średnio (20-60 min)' : 'Medium (20-60 mins)', 
      value: 'medium' 
    },
    { 
      label: isPolish ? 'Długo (> 1 godz)' : 'Long (> 1 hour)', 
      value: 'long' 
    }
  ];

  // Meal type options with translations
  const mealTypeOptions = [
    { 
      label: isPolish ? 'Śniadanie' : 'Breakfast', 
      value: 'breakfast' 
    },
    { 
      label: isPolish ? 'Obiad' : 'Lunch', 
      value: 'lunch' 
    },
    { 
      label: isPolish ? 'Kolacja' : 'Dinner', 
      value: 'dinner' 
    },
    { 
      label: isPolish ? 'Przekąska' : 'Snack', 
      value: 'snack' 
    }
  ];

  // Cuisine options with translations
  const cuisineOptions = [
    { 
      label: isPolish ? 'Włoska' : 'Italian', 
      value: 'italian' 
    },
    { 
      label: isPolish ? 'Polska' : 'Polish', 
      value: 'polish' 
    },
    { 
      label: isPolish ? 'Meksykańska' : 'Mexican', 
      value: 'mexican' 
    },
    { 
      label: isPolish ? 'Azjatycka' : 'Asian', 
      value: 'asian' 
    },
    { 
      label: isPolish ? 'Amerykańska' : 'American', 
      value: 'american' 
    },
    { 
      label: isPolish ? 'Francuska' : 'French', 
      value: 'french' 
    }
  ];

  // Function to handle diet selection and deselection
  const toggleDiet = (value: string) => {
    if (diet === value) {
      // If the same value is selected again, deselect it
      setDiet('');
    } else {
      // Otherwise select the new value
      setDiet(value);
    }
  };

  // Function to handle meal type selection and deselection
  const toggleMealType = (value: string) => {
    if (mealType === value) {
      // If the same value is selected again, deselect it
      setMealType('');
    } else {
      // Otherwise select the new value
      setMealType(value);
    }
  };

  // Function to handle cuisine selection and deselection
  const toggleCuisine = (value: string) => {
    if (cuisine === value) {
      // If the same value is selected again, deselect it
      setCuisine('');
    } else {
      // Otherwise select the new value
      setCuisine(value);
    }
  };

  // Extract recipe name from the content
  const getRecipeName = (): string => {
    if (!recipe) return '';
    
    const sections = recipe.split('\n\n');
    if (sections.length === 0) return '';
    
    // Get the first section (recipe name) and clean it
    let recipeName = sections[0]
      .replace(/^<recipe_name>\s*/, '')
      .replace(/^###\s*/, '')
      .trim();
    
    // If it's too long, truncate it
    if (recipeName.length > 50) {
      recipeName = recipeName.substring(0, 47) + '...';
    }
    
    return recipeName;
  };

  // Update a dietary component's preference
  const updateDietaryComponentPreference = (component: string, preference: DietaryComponentPreference) => {
    setDietaryComponents(prev => ({
      ...prev,
      [component]: { 
        ...prev[component], 
        preference,
        // Clear amount if not including
        ...(preference !== 'include' ? { amount: undefined } : {})
      }
    }));
  };
  
  // Update a dietary component's amount
  const updateDietaryComponentAmount = (component: string, amount: string) => {
    // If empty string, update with undefined amount
    if (amount === '') {
      setDietaryComponents(prev => ({
        ...prev,
        [component]: { ...prev[component], amount: undefined }
      }));
      return;
    }

    const parsedAmount = parseInt(amount, 10);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      setDietaryComponents(prev => ({
        ...prev,
        [component]: { ...prev[component], amount: parsedAmount }
      }));
    }
  };
  
  // Get the count of dietary preferences that are not 'default'
  const getActiveDietaryComponentsCount = () => {
    return Object.values(dietaryComponents).filter(
      component => component.preference !== 'default'
    ).length;
  };
  
  // Get a summary of dietary components for display
  const getDietaryComponentsSummary = () => {
    const activeCount = getActiveDietaryComponentsCount();
    
    if (activeCount === 0) {
      return isPolish ? 'Wszystkie wartości auto' : 'All auto values';
    }
    
    return isPolish 
      ? `${activeCount} aktywnych preferencji`
      : `${activeCount} active preferences`;
  };

  // Get component label based on language
  const getComponentLabel = (componentId: string) => {
    const component = DIETARY_COMPONENTS.find(c => c.id === componentId);
    return component ? (isPolish ? component.label.pl : component.label.en) : componentId;
  };

  // Function to generate dietary requirements summary for the generated recipe
  const getDietaryRequirementsSummary = () => {
    if (!Object.keys(dietaryComponents).length) return null;
    
    const includedItems = [];
    const limitedItems = [];
    const excludedItems = [];
    
    for (const [componentId, settings] of Object.entries(dietaryComponents)) {
      const displayName = getComponentLabel(componentId);
      
      if (settings.preference === 'include' && settings.amount) {
        includedItems.push(`${displayName} (${settings.amount}g)`);
      } else if (settings.preference === 'limit' && settings.amount) {
        limitedItems.push(`${displayName} (max ${settings.amount}g)`);
      } else if (settings.preference === 'exclude') {
        excludedItems.push(displayName);
      }
    }
    
    if (!includedItems.length && !limitedItems.length && !excludedItems.length) {
      return null;
    }
    
    return (
      <ThemedView style={styles.dietarySummary}>
        <ThemedText style={styles.dietarySummaryTitle}>
          {isPolish ? 'Wymagania dietetyczne:' : 'Dietary Requirements:'}
        </ThemedText>
        
        {includedItems.length > 0 && (
          <ThemedView style={styles.dietarySummaryItem}>
            <ThemedText style={styles.dietarySummaryLabel}>
              {isPolish ? 'Zawiera:' : 'Includes:'}
            </ThemedText>
            <ThemedText>{includedItems.join(', ')}</ThemedText>
          </ThemedView>
        )}
        
        {limitedItems.length > 0 && (
          <ThemedView style={styles.dietarySummaryItem}>
            <ThemedText style={styles.dietarySummaryLabel}>
              {isPolish ? 'Ograniczone:' : 'Limited:'}
            </ThemedText>
            <ThemedText>{limitedItems.join(', ')}</ThemedText>
          </ThemedView>
        )}
        
        {excludedItems.length > 0 && (
          <ThemedView style={styles.dietarySummaryItem}>
            <ThemedText style={styles.dietarySummaryLabel}>
              {isPolish ? 'Wykluczone:' : 'Excluded:'}
            </ThemedText>
            <ThemedText>{excludedItems.join(', ')}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <ThemedView style={styles.formContainer}>
        {/* Language Toggle */}
        <View style={styles.titleContainer}>
          <ThemedText type="title">{isPolish ? 'Generator Przepisów' : 'Recipe Generator'}</ThemedText>
          <View style={{ flex: 1 }} />
          <View style={styles.languageToggle}>
            <Switch
              value={isPolish}
              onValueChange={setIsPolish}
              trackColor={{ false: '#ccc', true: '#a1cedc' }}
              thumbColor={isPolish ? '#1D3D47' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Preparation Time */}
        <ThemedView style={[styles.fieldContainer, styles.oddSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Czas przygotowania' : 'Preparation Time'}
          </ThemedText>
          <Pressable 
            style={styles.sectionButton}
            onPress={() => setShowPrepTimeOptions(!showPrepTimeOptions)}
          >
            <ThemedText>
              {prepTime === 'any' 
                ? (isPolish ? 'Dowolny czas' : 'Any time') 
                : prepTimeOptions.find(option => option.value === prepTime)?.label || (isPolish ? 'Wybierz czas' : 'Select time')}
            </ThemedText>
          </Pressable>
          
          {showPrepTimeOptions && (
            <ThemedView style={styles.optionsContainer}>
              {prepTimeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    prepTime === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    setPrepTime(option.value);
                    setShowPrepTimeOptions(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    prepTime === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Diet Selection */}
        <ThemedView style={[styles.fieldContainer, styles.evenSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Preferencje dietetyczne' : 'Dietary Preference'}
          </ThemedText>
          <Pressable 
            style={styles.sectionButton}
            onPress={() => setShowDietOptions(!showDietOptions)}
          >
            <ThemedText>
              {diet 
                ? dietOptions.find(option => option.value === diet)?.label || (isPolish ? 'Wybierz dietę' : 'Select diet')
                : isPolish ? 'Brak preferencji' : 'No preference'}
            </ThemedText>
          </Pressable>
          
          {showDietOptions && (
            <ThemedView style={styles.optionsContainer}>
              {dietOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    diet === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    toggleDiet(option.value);
                    setShowDietOptions(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    diet === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Meal Type Selection */}
        <ThemedView style={[styles.fieldContainer, styles.oddSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Typ posiłku' : 'Meal Type'}
          </ThemedText>
          <Pressable 
            style={styles.sectionButton}
            onPress={() => setShowMealTypeOptions(!showMealTypeOptions)}
          >
            <ThemedText>
              {mealType 
                ? mealTypeOptions.find(option => option.value === mealType)?.label || (isPolish ? 'Wybierz typ' : 'Select type')
                : isPolish ? 'Dowolny typ' : 'Any type'}
            </ThemedText>
          </Pressable>
          
          {showMealTypeOptions && (
            <ThemedView style={styles.optionsContainer}>
              {mealTypeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    mealType === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    toggleMealType(option.value);
                    setShowMealTypeOptions(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    mealType === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        </ThemedView>
        
        {/* Cuisine Selection */}
        <ThemedView style={[styles.fieldContainer, styles.evenSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Kuchnia' : 'Cuisine'}
          </ThemedText>
          <Pressable 
            style={styles.sectionButton}
            onPress={() => setShowCuisineOptions(!showCuisineOptions)}
          >
            <ThemedText>
              {cuisine 
                ? cuisineOptions.find(option => option.value === cuisine)?.label || (isPolish ? 'Wybierz kuchnię' : 'Select cuisine')
                : isPolish ? 'Dowolna kuchnia' : 'Any cuisine'}
            </ThemedText>
          </Pressable>
          
          {showCuisineOptions && (
            <ThemedView style={styles.optionsContainer}>
              {cuisineOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    cuisine === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    toggleCuisine(option.value);
                    setShowCuisineOptions(false);
                  }}
                >
                  <ThemedText style={[
                    styles.optionText,
                    cuisine === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          )}
        </ThemedView>

        {/* Dietary Components */}
        <ThemedView style={[styles.fieldContainer, styles.oddSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Składniki odżywcze' : 'Dietary Components'}
          </ThemedText>
          <Pressable
            style={styles.dietaryComponentsButton}
            onPress={() => setShowDietaryComponentsModal(true)}
          >
            <ThemedText>
              {getDietaryComponentsSummary()}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Ingredients */}
        <ThemedView style={[styles.fieldContainer, styles.evenSection]}>
          <ThemedText style={styles.sectionHeader}>
            {isPolish ? 'Składniki' : 'Ingredients'}
          </ThemedText>
          <Pressable
            style={styles.ingredientsButton}
            onPress={() => setShowIngredientPicker(!showIngredientPicker)}
          >
            <ThemedText>
              {getSelectedIngredientsText()}
            </ThemedText>
          </Pressable>

          {showIngredientPicker && (
            <ThemedView style={styles.ingredientsPickerContainer}>
              {/* Search input */}
              <TextInput
                style={styles.searchInput}
                placeholder={isPolish ? "Szukaj składników..." : "Search ingredients..."}
                value={ingredientSearch}
                onChangeText={setIngredientSearch}
                placeholderTextColor="#999"
              />
              
              {/* Display ingredients by category */}
              <ThemedView style={styles.categoriesContainer}>
                {Object.entries(getIngredientsByCategory()).map(([categoryId, ingredients]) => (
                  // Only render categories that have ingredients (after filtering)
                  ingredients.length > 0 && (
                    <ThemedView key={categoryId} style={styles.categorySection}>
                      <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                        {getCategoryLabel(categoryId)}
                      </ThemedText>
                      <ThemedView style={styles.ingredientsList}>
                        {ingredients.map((ingredient) => (
                          <Pressable
                            key={ingredient.value}
                            style={[
                              styles.ingredientItem,
                              selectedIngredients.includes(ingredient.value) && styles.selectedIngredient,
                            ]}
                            onPress={() => toggleIngredient(ingredient.value)}
                          >
                            <ThemedText>
                              {getIngredientLabel(ingredient)}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </ThemedView>
                    </ThemedView>
                  )
                ))}
              </ThemedView>
            </ThemedView>
          )}
          
          {/* Only use selected ingredients toggle */}
          {selectedIngredients.length > 0 && (
            <ThemedView style={styles.restrictIngredientsContainer}>
              <ThemedText>
                {isPolish ? 'Używaj tylko wybranych składników' : 'Use only selected ingredients'}
              </ThemedText>
              <Switch
                value={useOnlySelected}
                onValueChange={setUseOnlySelected}
                trackColor={{ false: '#767577', true: '#a1cedc' }}
                thumbColor={useOnlySelected ? '#1D3D47' : '#f4f3f4'}
              />
            </ThemedView>
          )}
        </ThemedView>

        {/* Recipe Count Selection */}
        <ThemedView style={[styles.fieldContainer, styles.oddSection]}>
          <View style={styles.recipeCountRow}>
            <ThemedText style={styles.sectionHeader}>
              {isPolish ? 'Liczba przepisów:' : 'Number of recipes:'}
            </ThemedText>
            <View style={styles.recipeCountContainer}>
              <Pressable
                style={styles.countButton}
                onPress={() => setRecipeCount(Math.max(1, recipeCount - 1))}
              >
                <ThemedText style={styles.countButtonText}>-</ThemedText>
              </Pressable>
              <ThemedText style={styles.recipeCountText}>{recipeCount}</ThemedText>
              <Pressable
                style={styles.countButton}
                onPress={() => setRecipeCount(Math.min(7, recipeCount + 1))}
              >
                <ThemedText style={styles.countButtonText}>+</ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>

        {/* Buttons Container - no background styling */}
        <ThemedView style={styles.buttonsContainer}>
          {/* Clear Filters Button */}
          <ModernButton
            onPress={() => {
              setDiet('');
              setPrepTime('any');
              setSelectedIngredients([]);
              setMealType('');
              setCuisine('');
              setUseOnlySelected(false);
              setDietaryComponents({
                carbohydrates: { preference: 'default' },
                proteins: { preference: 'default' },
                fats: { preference: 'default' },
                sugars: { preference: 'default' },
                fiber: { preference: 'default' },
                sodium: { preference: 'default' },
                cholesterol: { preference: 'default' },
              });
            }}
            gradientColors={['#ef4444', '#b91c1c']}
            style={{ marginBottom: 12, borderRadius: 8 }}
          >
            <ThemedText style={styles.buttonText}>
              {isPolish ? 'Wyczyść filtry' : 'Clear filters'}
            </ThemedText>
          </ModernButton>

          {/* Generate Buttons */}
          <ModernButton
            onPress={recipeCount > 1 ? handleGenerateMultipleRecipes : handleGenerateRecipe}
            disabled={loading}
            gradientColors={['#3b82f6', '#1d4ed8']}
            style={{ borderRadius: 8 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {isPolish 
                  ? (recipeCount > 1 ? `Wygeneruj ${recipeCount} przepisy` : 'Wygeneruj przepis')
                  : (recipeCount > 1 ? `Generate ${recipeCount} recipes` : 'Generate recipe')
                }
              </ThemedText>
            )}
          </ModernButton>
        </ThemedView>
      </ThemedView>

      {/* Recipes Display */}
      {showMultipleRecipes && recipes.length > 0 ? (
        <ThemedView style={styles.recipeContainer}>
          <View style={styles.recipeHeader}>
            <ThemedText type="subtitle">
              {isPolish ? 'Przepisy' : 'Recipes'}
            </ThemedText>
          </View>
          
          {/* List of recipes */}
          <View style={styles.recipesList}>
            {recipes.map((recipeItem, index) => (
              <ThemedView key={index} style={styles.recipeCard}>
                {/* Recipe header with name and expand/collapse button */}
                <Pressable 
                  style={styles.recipeCardHeader} 
                  onPress={() => toggleRecipeExpanded(index)}
                >
                  <ThemedText style={styles.recipeCardTitle}>
                    {recipeItem.name || (isPolish ? 'Przepis bez nazwy' : 'Unnamed Recipe')}
                  </ThemedText>
                  <ThemedText>
                    {recipeItem.expanded ? '▼' : '▶'}
                  </ThemedText>
                </Pressable>
                
                {/* Recipe content (expanded view) */}
                {recipeItem.expanded && (
                  <View style={styles.recipeCardContent}>
                    <ThemedText style={styles.recipeText}>
                      {recipeItem.content}
                    </ThemedText>
                    
                    {/* Recipe actions */}
                    <View style={styles.recipeCardActions}>
                      <ModernButton
                        onPress={() => handleSaveSpecificRecipe(recipeItem.content)}
                        gradientColors={['#10b981', '#047857']}
                      >
                        <ThemedText style={styles.buttonText}>
                          {isPolish ? 'Zapisz' : 'Save'}
                        </ThemedText>
                      </ModernButton>
                    </View>
                  </View>
                )}
              </ThemedView>
            ))}
          </View>
        </ThemedView>
      ) : (
        /* Single Recipe Result - show the original recipe view*/
        recipe && (
          <ThemedView style={styles.recipeContainer}>
            <View style={styles.recipeHeader}>
              <ThemedText type="subtitle">
                {isPolish ? 'Przepis' : 'Recipe'}
              </ThemedText>
              
              <View style={styles.recipeButtonsContainer}>
                <ModernButton
                  onPress={() => handleGenerateRecipe()}
                  style={{ marginRight: 8 }}
                  gradientColors={['#3b82f6', '#1d4ed8']}
                >
                  <ThemedText style={styles.buttonText}>
                    {isPolish ? 'Ponów' : 'Regenerate'}
                  </ThemedText>
                </ModernButton>
                
                <ModernButton
                  onPress={handleSaveRecipe}
                  gradientColors={['#10b981', '#047857']}
                >
                  <ThemedText style={styles.buttonText}>
                    {isPolish ? 'Zapisz' : 'Save'}
                  </ThemedText>
                </ModernButton>
              </View>
            </View>
            
            {/* Show the raw recipe response without section formatting */}
            <ThemedText style={styles.recipeText}>
              {recipe}
            </ThemedText>
          </ThemedView>
        )
      )}

      {/* Modal for dietary components */}
      <Modal
        visible={showDietaryComponentsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDietaryComponentsModal(false)}
        statusBarTranslucent={true}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowDietaryComponentsModal(false)}
        >
          <Pressable 
            style={[styles.modalContent, {width: '90%', maxWidth: 400}]} 
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView style={{width: '100%', alignItems: 'center'}}>
              <ThemedText type="subtitle" style={styles.modalHeader}>
                {isPolish ? 'Składniki odżywcze' : 'Dietary Components'}
              </ThemedText>
            </ThemedView>
            
            <ScrollView style={styles.componentsList}>
              {Object.entries(dietaryComponents).map(([componentId, settings]) => (
                <ThemedView key={componentId} style={styles.componentItem}>
                  <ThemedText type="defaultSemiBold">{getComponentLabel(componentId)}</ThemedText>
                  
                  <ThemedView style={styles.preferencesContainer}>
                    <ThemedView style={styles.preferenceButtons}>
                      <Pressable
                        style={[
                          styles.preferenceButton,
                          settings.preference === 'include' && styles.activePreferenceButton
                        ]}
                        onPress={() => updateDietaryComponentPreference(componentId, settings.preference === 'include' ? 'default' : 'include')}
                      >
                        <ThemedText style={[
                          styles.preferenceButtonText,
                          settings.preference === 'include' && styles.activePreferenceText
                        ]}>
                          {isPolish ? 'Dodaj' : 'Include'}
                        </ThemedText>
                      </Pressable>
                      
                      <Pressable
                        style={[
                          styles.preferenceButton,
                          settings.preference === 'limit' && styles.activePreferenceButton
                        ]}
                        onPress={() => updateDietaryComponentPreference(componentId, settings.preference === 'limit' ? 'default' : 'limit')}
                      >
                        <ThemedText style={[
                          styles.preferenceButtonText,
                          settings.preference === 'limit' && styles.activePreferenceText
                        ]}>
                          {isPolish ? 'Ogranicz' : 'Limit'}
                        </ThemedText>
                      </Pressable>
                      
                      <Pressable
                        style={[
                          styles.preferenceButton,
                          settings.preference === 'exclude' && styles.activePreferenceButton
                        ]}
                        onPress={() => updateDietaryComponentPreference(componentId, settings.preference === 'exclude' ? 'default' : 'exclude')}
                      >
                        <ThemedText style={[
                          styles.preferenceButtonText,
                          settings.preference === 'exclude' && styles.activePreferenceText
                        ]}>
                          {isPolish ? 'Wyklucz' : 'Exclude'}
                        </ThemedText>
                      </Pressable>
                    </ThemedView>
                    
                    <ThemedText style={styles.preferenceDescription}>
                      {settings.preference === 'include' && (isPolish ? 'Dodaj określoną ilość' : 'Add specific amount')}
                      {settings.preference === 'limit' && (isPolish ? 'Ogranicz do maksymalnej ilości' : 'Limit to maximum amount')}
                      {settings.preference === 'exclude' && (isPolish ? 'Całkowicie wyklucz z przepisu' : 'Completely exclude from recipe')}
                      {settings.preference === 'default' && (isPolish ? 'Automatyczna ilość (domyślne)' : 'Automatic amount (default)')}
                    </ThemedText>
                  </ThemedView>
                  
                  {(settings.preference === 'include' || settings.preference === 'limit') && (
                    <View style={styles.amountInputContainer}>
                      <ThemedText style={{marginRight: 8}}>
                        {settings.preference === 'include' ? 
                          (isPolish ? 'Ilość:' : 'Amount:') : 
                          (isPolish ? 'Maksymalnie:' : 'Maximum:')}
                      </ThemedText>
                      <TextInput
                        style={styles.amountInput}
                        value={settings.amount?.toString() || ''}
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, '');
                          if (numericValue === '' || parseInt(numericValue, 10) > 0) {
                            updateDietaryComponentAmount(componentId, numericValue);
                          }
                        }}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                      <ThemedText style={{marginLeft: 8}}>g</ThemedText>
                    </View>
                  )}
                </ThemedView>
              ))}
            </ScrollView>
            
            <ModernButton
              onPress={() => setShowDietaryComponentsModal(false)}
              gradientColors={['#64748b', '#475569']}
            >
              <ThemedText style={styles.buttonText}>
                {isPolish ? 'Zamknij' : 'Close'}
              </ThemedText>
            </ModernButton>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingBottom: 85, // Add padding at bottom for better scrolling experience
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formContainer: {
    gap: 0, // Remove gap to control spacing with section padding
  },
  fieldContainer: {
    gap: 8,
    padding: 16,
    paddingBottom: 24,
  },
  oddSection: {
    backgroundColor: '#f9f9f9',
  },
  evenSection: {
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  pickerContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  selectedOption: {
    backgroundColor: '#1D3D47',
  },
  optionText: {
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  ingredientsButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ingredientsPickerContainer: {
    gap: 8,
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  categoriesContainer: {
    gap: 16,
    marginTop: 8,
  },
  categorySection: {
    gap: 8,
  },
  categoryTitle: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientItem: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
  },
  selectedIngredient: {
    backgroundColor: '#a1cedc',
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffecec',
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
  },
  recipeContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    gap: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  restrictIngredientsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
  },
  dietaryComponentsButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  componentsList: {
    width: '100%',
  },
  componentItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    gap: 8,
  },
  preferencesContainer: {
    gap: 8,
  },
  preferenceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  preferenceButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activePreferenceButton: {
    backgroundColor: '#007bff',
  },
  preferenceButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activePreferenceText: {
    color: '#fff',
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  amountInput: {
    flex: 1,
    padding: 8,
  },
  dietarySummary: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dietarySummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dietarySummaryItem: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietarySummaryLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  sectionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
    width: '100%',
  },
  recipeText: {
    marginTop: 16,
    lineHeight: 22,
  },
  recipeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  countButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeCountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipesList: {
    gap: 16,
  },
  recipeCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeCardContent: {
    padding: 12,
  },
  recipeCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonsContainer: {
    padding: 16,
    paddingTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
