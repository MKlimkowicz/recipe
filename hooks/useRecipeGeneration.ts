import { useState } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';

// API endpoint configuration
const API_CONFIG = {
  // When running in the simulator or emulator, we need to use special IP addresses
  // localhost in the context of a mobile app refers to the device itself, not your computer
  development: Platform.select({
    ios: 'http://localhost:4000/recipe/generate', // Will work in iOS simulator
    android: 'http://10.0.2.2:4000/recipe/generate', // Special IP for Android emulator
    default: 'http://localhost:4000/recipe/generate'
  }),
  // When deployed to production (replace with your actual deployed endpoint)
  production: 'https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/recipe/generate'
};

// Get the current environment
const IS_DEV = process.env.NODE_ENV !== 'production';
const API_ENDPOINT = IS_DEV ? API_CONFIG.development : API_CONFIG.production;

// Categories definition with translations
export const INGREDIENT_CATEGORIES = [
  { id: 'meats', label: { en: 'Meats', pl: 'Mięso' } },
  { id: 'seafood', label: { en: 'Fish & Seafood', pl: 'Ryby i Owoce Morza' } },
  { id: 'plant_protein', label: { en: 'Plant-based Proteins', pl: 'Białka Roślinne' } },
  { id: 'grains', label: { en: 'Grains', pl: 'Zboża' } },
  { id: 'vegetables', label: { en: 'Vegetables', pl: 'Warzywa' } },
  { id: 'dairy', label: { en: 'Dairy & Eggs', pl: 'Nabiał i Jajka' } },
  { id: 'legumes', label: { en: 'Legumes', pl: 'Rośliny Strączkowe' } },
  { id: 'fruits', label: { en: 'Fruits', pl: 'Owoce' } },
  { id: 'nuts', label: { en: 'Nuts & Seeds', pl: 'Orzechy i Nasiona' } },
  { id: 'herbs', label: { en: 'Herbs & Spices', pl: 'Zioła i Przyprawy' } }
];

// Predefined list of common ingredients with translations and categories
export const COMMON_INGREDIENTS = [
  // Meats
  { value: 'Chicken', label: { en: 'Chicken', pl: 'Kurczak' }, category: 'meats' },
  { value: 'Beef', label: { en: 'Beef', pl: 'Wołowina' }, category: 'meats' },
  { value: 'Pork', label: { en: 'Pork', pl: 'Wieprzowina' }, category: 'meats' },
  { value: 'Turkey', label: { en: 'Turkey', pl: 'Indyk' }, category: 'meats' },
  { value: 'Duck', label: { en: 'Duck', pl: 'Kaczka' }, category: 'meats' },
  { value: 'Lamb', label: { en: 'Lamb', pl: 'Jagnięcina' }, category: 'meats' },
  { value: 'Ground meat', label: { en: 'Ground meat', pl: 'Mięso mielone' }, category: 'meats' },
  
  // Fish & Seafood
  { value: 'Salmon', label: { en: 'Salmon', pl: 'Łosoś' }, category: 'seafood' },
  { value: 'Tuna', label: { en: 'Tuna', pl: 'Tuńczyk' }, category: 'seafood' },
  { value: 'Cod', label: { en: 'Cod', pl: 'Dorsz' }, category: 'seafood' },
  { value: 'Shrimp', label: { en: 'Shrimp', pl: 'Krewetki' }, category: 'seafood' },
  { value: 'Trout', label: { en: 'Trout', pl: 'Pstrąg' }, category: 'seafood' },
  
  // Plant-based proteins
  { value: 'Tofu', label: { en: 'Tofu', pl: 'Tofu' }, category: 'plant_protein' },
  { value: 'Tempeh', label: { en: 'Tempeh', pl: 'Tempeh' }, category: 'plant_protein' },
  { value: 'Seitan', label: { en: 'Seitan', pl: 'Seitan' }, category: 'plant_protein' },
  
  // Grains
  { value: 'Rice', label: { en: 'Rice', pl: 'Ryż' }, category: 'grains' },
  { value: 'Pasta', label: { en: 'Pasta', pl: 'Makaron' }, category: 'grains' },
  { value: 'Quinoa', label: { en: 'Quinoa', pl: 'Quinoa' }, category: 'grains' },
  { value: 'Couscous', label: { en: 'Couscous', pl: 'Kuskus' }, category: 'grains' },
  { value: 'Bulgur', label: { en: 'Bulgur', pl: 'Bulgur' }, category: 'grains' },
  { value: 'Oats', label: { en: 'Oats', pl: 'Owies' }, category: 'grains' },
  { value: 'Barley', label: { en: 'Barley', pl: 'Jęczmień' }, category: 'grains' },
  
  // Vegetables
  { value: 'Potatoes', label: { en: 'Potatoes', pl: 'Ziemniaki' }, category: 'vegetables' },
  { value: 'Sweet potatoes', label: { en: 'Sweet potatoes', pl: 'Bataty' }, category: 'vegetables' },
  { value: 'Onions', label: { en: 'Onions', pl: 'Cebula' }, category: 'vegetables' },
  { value: 'Garlic', label: { en: 'Garlic', pl: 'Czosnek' }, category: 'vegetables' },
  { value: 'Tomatoes', label: { en: 'Tomatoes', pl: 'Pomidory' }, category: 'vegetables' },
  { value: 'Bell peppers', label: { en: 'Bell peppers', pl: 'Papryka' }, category: 'vegetables' },
  { value: 'Mushrooms', label: { en: 'Mushrooms', pl: 'Grzyby' }, category: 'vegetables' },
  { value: 'Zucchini', label: { en: 'Zucchini', pl: 'Cukinia' }, category: 'vegetables' },
  { value: 'Eggplant', label: { en: 'Eggplant', pl: 'Bakłażan' }, category: 'vegetables' },
  { value: 'Spinach', label: { en: 'Spinach', pl: 'Szpinak' }, category: 'vegetables' },
  { value: 'Broccoli', label: { en: 'Broccoli', pl: 'Brokuły' }, category: 'vegetables' },
  { value: 'Cauliflower', label: { en: 'Cauliflower', pl: 'Kalafior' }, category: 'vegetables' },
  { value: 'Cabbage', label: { en: 'Cabbage', pl: 'Kapusta' }, category: 'vegetables' },
  { value: 'Carrots', label: { en: 'Carrots', pl: 'Marchew' }, category: 'vegetables' },
  { value: 'Peas', label: { en: 'Peas', pl: 'Groszek' }, category: 'vegetables' },
  { value: 'Corn', label: { en: 'Corn', pl: 'Kukurydza' }, category: 'vegetables' },
  { value: 'Asparagus', label: { en: 'Asparagus', pl: 'Szparagi' }, category: 'vegetables' },
  { value: 'Cucumber', label: { en: 'Cucumber', pl: 'Ogórek' }, category: 'vegetables' },
  { value: 'Lettuce', label: { en: 'Lettuce', pl: 'Sałata' }, category: 'vegetables' },
  
  // Dairy & Eggs
  { value: 'Eggs', label: { en: 'Eggs', pl: 'Jajka' }, category: 'dairy' },
  { value: 'Cheese', label: { en: 'Cheese', pl: 'Ser' }, category: 'dairy' },
  { value: 'Milk', label: { en: 'Milk', pl: 'Mleko' }, category: 'dairy' },
  { value: 'Yogurt', label: { en: 'Yogurt', pl: 'Jogurt' }, category: 'dairy' },
  { value: 'Butter', label: { en: 'Butter', pl: 'Masło' }, category: 'dairy' },
  { value: 'Cream', label: { en: 'Cream', pl: 'Śmietana' }, category: 'dairy' },
  
  // Legumes
  { value: 'Lentils', label: { en: 'Lentils', pl: 'Soczewica' }, category: 'legumes' },
  { value: 'Chickpeas', label: { en: 'Chickpeas', pl: 'Ciecierzyca' }, category: 'legumes' },
  { value: 'Beans', label: { en: 'Beans', pl: 'Fasola' }, category: 'legumes' },
  { value: 'Black beans', label: { en: 'Black beans', pl: 'Czarna fasola' }, category: 'legumes' },
  { value: 'Pinto beans', label: { en: 'Pinto beans', pl: 'Fasola pinto' }, category: 'legumes' },
  
  // Fruits
  { value: 'Apples', label: { en: 'Apples', pl: 'Jabłka' }, category: 'fruits' },
  { value: 'Bananas', label: { en: 'Bananas', pl: 'Banany' }, category: 'fruits' },
  { value: 'Berries', label: { en: 'Berries', pl: 'Jagody' }, category: 'fruits' },
  { value: 'Lemons', label: { en: 'Lemons', pl: 'Cytryny' }, category: 'fruits' },
  { value: 'Limes', label: { en: 'Limes', pl: 'Limonki' }, category: 'fruits' },
  { value: 'Oranges', label: { en: 'Oranges', pl: 'Pomarańcze' }, category: 'fruits' },
  { value: 'Pineapple', label: { en: 'Pineapple', pl: 'Ananas' }, category: 'fruits' },
  
  // Nuts & Seeds
  { value: 'Almonds', label: { en: 'Almonds', pl: 'Migdały' }, category: 'nuts' },
  { value: 'Walnuts', label: { en: 'Walnuts', pl: 'Orzechy włoskie' }, category: 'nuts' },
  { value: 'Peanuts', label: { en: 'Peanuts', pl: 'Orzeszki ziemne' }, category: 'nuts' },
  { value: 'Cashews', label: { en: 'Cashews', pl: 'Nerkowce' }, category: 'nuts' },
  { value: 'Sunflower seeds', label: { en: 'Sunflower seeds', pl: 'Pestki słonecznika' }, category: 'nuts' },
  { value: 'Chia seeds', label: { en: 'Chia seeds', pl: 'Nasiona chia' }, category: 'nuts' },
  { value: 'Flaxseeds', label: { en: 'Flaxseeds', pl: 'Siemię lniane' }, category: 'nuts' },
  
  // Herbs & Spices
  { value: 'Basil', label: { en: 'Basil', pl: 'Bazylia' }, category: 'herbs' },
  { value: 'Oregano', label: { en: 'Oregano', pl: 'Oregano' }, category: 'herbs' },
  { value: 'Thyme', label: { en: 'Thyme', pl: 'Tymianek' }, category: 'herbs' },
  { value: 'Rosemary', label: { en: 'Rosemary', pl: 'Rozmaryn' }, category: 'herbs' },
  { value: 'Parsley', label: { en: 'Parsley', pl: 'Pietruszka' }, category: 'herbs' },
  { value: 'Cilantro', label: { en: 'Cilantro', pl: 'Kolendra' }, category: 'herbs' },
  { value: 'Ginger', label: { en: 'Ginger', pl: 'Imbir' }, category: 'herbs' },
  { value: 'Cumin', label: { en: 'Cumin', pl: 'Kminek' }, category: 'herbs' },
  { value: 'Cinnamon', label: { en: 'Cinnamon', pl: 'Cynamon' }, category: 'herbs' }
];

// Type definitions
export interface RecipeOptions {
  diet?: string;
  prepTime?: string;
  ingredients?: string[];
  language?: string;
  displayLanguage?: string; // The language for displaying the recipe (might differ from generation language)
  mealType?: string;
  cuisine?: string;
  useOnlySelected?: boolean;
  dietaryComponents?: {
    [key: string]: {
      preference: 'include' | 'exclude' | 'limit' | 'default';
      amount?: number; // amount in grams, applicable when preference is 'include' or 'limit'
    }
  };
  randomSeed?: number; // Random seed to ensure different recipes even with same inputs
}

// Interface for a single recipe
export interface Recipe {
  content: string;
  name?: string;
  expanded?: boolean;
}

export interface RecipeGenerationHook {
  recipe: string | null;  // Keeping for backward compatibility
  recipes: Recipe[];      // New array of recipes
  loading: boolean;
  error: string | null;
  generateRecipe: (options: RecipeOptions) => Promise<string>;
  generateMultipleRecipes: (options: RecipeOptions, count: number) => Promise<Recipe[]>;
  resetRecipe: () => void;
  resetRecipes: () => void;
  toggleRecipeExpanded: (index: number) => void;
}

/**
 * Custom hook for generating recipes using the OpenAI API through Lambda
 * 
 * @returns {RecipeGenerationHook} Hook methods and state
 */
export const useRecipeGeneration = (): RecipeGenerationHook => {
  const [recipe, setRecipe] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a recipe based on the provided parameters
   * 
   * @param {RecipeOptions} options - Recipe generation parameters
   * @returns {Promise<string>} Promise resolving to the generated recipe
   */
  const generateRecipe = async (options: RecipeOptions): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Make sure we have a random seed
      if (!options.randomSeed) {
        options.randomSeed = Math.floor(Math.random() * 10000);
      }
      
      // Get target display language (what language to display the recipe in)
      const outputLanguage = options.displayLanguage || 'english';
      
      // Create recipe generation prompt with output language instructions
      const { prompt, requestData } = createRecipePrompt(options, outputLanguage);
      
      try {
        // Make a single request that includes output language instructions
        const recipeResponse = await executeRecipeRequest(prompt, requestData);
        setRecipe(recipeResponse);
        return recipeResponse;
      } catch (requestErr: any) {
        // Handle server unavailable errors
        if (isServerUnavailable(requestErr)) {
          return handleServerUnavailable(options, prompt);
        }
        throw requestErr;
      }
    } catch (err) {
      console.error('Failed to generate recipe:', err);
      setError('Failed to generate recipe. Please try again.');
      return '';
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate multiple recipes based on the provided parameters
   * 
   * @param {RecipeOptions} options - Recipe generation parameters
   * @param {number} count - Number of recipes to generate
   * @returns {Promise<Recipe[]>} Promise resolving to the generated recipes
   */
  const generateMultipleRecipes = async (options: RecipeOptions, count: number): Promise<Recipe[]> => {
    setLoading(true);
    setError(null);
    setRecipes([]);
    
    try {
      const generatedRecipes: Recipe[] = [];
      const usedNames = new Set<string>();
      
      for (let i = 0; i < count; i++) {
        // Create a new seed for each recipe to ensure variety
        const recipeSeed = Math.floor(Math.random() * 10000) + i * 1000;
        
        // Add diversity instructions for each subsequent recipe
        let diversityInstructions = "";
        if (i > 0 && generatedRecipes.length > 0) {
          // Extract names of previously generated recipes
          const previousNames = generatedRecipes.map(r => r.name).join(", ");
          
          diversityInstructions = `\n\nIMPORTANT: Create a recipe that is significantly different from the following recipes already generated: ${previousNames}. 
Use different main techniques, cooking methods, flavor profiles, or ingredient combinations.`;
        }
        
        const recipeOptions = {
          ...options,
          randomSeed: recipeSeed,
        };
        
        // Get target display language
        const outputLanguage = options.displayLanguage || 'english';
        
        // Create recipe generation prompt
        const { prompt, requestData } = createRecipePrompt(recipeOptions, outputLanguage, diversityInstructions, true);
        
        try {
          // Generate a recipe
          const recipeContent = await executeRecipeRequest(prompt, requestData);
          
          // Extract the recipe name from the content
          const name = extractRecipeName(recipeContent);
          
          // Check for duplicate names (extremely similar recipes)
          if (usedNames.has(name.toLowerCase())) {
            // Try regenerating with a different seed if we got a duplicate
            i--; // Retry this iteration
            continue;
          }
          
          // Add to the set of used names
          usedNames.add(name.toLowerCase());
          
          // Add to the recipes array
          generatedRecipes.push({
            content: recipeContent,
            name: name,
            expanded: false
          });
        } catch (requestErr: any) {
          // Handle server unavailable errors
          if (isServerUnavailable(requestErr)) {
            const mockRecipe = handleServerUnavailable(recipeOptions, prompt);
            
            // Extract name
            const name = extractRecipeName(mockRecipe);
            
            // Add to the recipes array
            generatedRecipes.push({
              content: mockRecipe,
              name: name,
              expanded: false
            });
          } else {
            throw requestErr;
          }
        }
      }
      
      setRecipes(generatedRecipes);
      
      // Also set the single recipe state to the first recipe for backward compatibility
      if (generatedRecipes.length > 0) {
        setRecipe(generatedRecipes[0].content);
      }
      
      return generatedRecipes;
    } catch (err) {
      console.error('Failed to generate multiple recipes:', err);
      setError('Failed to generate recipes. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extract recipe name from recipe content
   */
  const extractRecipeName = (recipeContent: string): string => {
    // Try to extract name from the first line
    const lines = recipeContent.split('\n');
    if (lines.length > 0) {
      // Remove any special formatting or tags
      const nameCandidate = lines[0].replace(/<recipe_name>\s*/, '').replace(/^###\s*/, '').trim();
      if (nameCandidate) {
        return nameCandidate;
      }
    }
    return 'Untitled Recipe';
  };

  /**
   * Toggle the expanded state of a recipe
   */
  const toggleRecipeExpanded = (index: number): void => {
    setRecipes(prevRecipes => {
      const newRecipes = [...prevRecipes];
      if (newRecipes[index]) {
        newRecipes[index].expanded = !newRecipes[index].expanded;
      }
      return newRecipes;
    });
  };

  /**
   * Reset the recipes state
   */
  const resetRecipes = (): void => {
    setRecipes([]);
  };

  /**
   * Creates a recipe prompt with language instructions
   */
  const createRecipePrompt = (options: RecipeOptions, outputLanguage: string, diversityInstructions: string = "", isMultipleRecipes: boolean = false) => {
    // Convert any Polish values to English equivalents
    const englishDiet = convertToEnglish(options.diet);
    const englishMealType = convertToEnglish(options.mealType);
    const englishCuisine = convertToEnglish(options.cuisine);
    
    // Format the ingredients list
    let ingredientsPrompt = '';
    if (options.ingredients && options.ingredients.length > 0) {
      if (isMultipleRecipes && options.ingredients.length > 1 && !options.useOnlySelected) {
        // For multiple recipes with multiple ingredients, suggest using at least one
        ingredientsPrompt = `${options.ingredients.join(', ')} (use at least one of these ingredients in the recipe)`;
      } else {
        ingredientsPrompt = options.useOnlySelected 
          ? `${options.ingredients.join(', ')} (use ONLY these ingredients)`
          : `${options.ingredients.join(', ')} (you may add complementary ingredients)`;
      }
    }
    
    // Format diet preferences
    let dietPrompt = '';
    if (englishDiet && englishDiet !== 'any') {
      if (englishDiet === 'low_gi') {
        dietPrompt = 'Low glycemic index (use ingredients with GI below 55, avoid high GI foods)';
      } else if (englishDiet === 'meat') {
        dietPrompt = 'Meat-based (include meat as a main protein source)';
      } else {
        dietPrompt = englishDiet.charAt(0).toUpperCase() + englishDiet.slice(1);
      }
    }
    
    // Format dietary components requirements
    const dietaryComponentsPrompt = formatDietaryComponents(options.dietaryComponents);
    
    // Add language output instructions based on the display language
    const languageInstructions = outputLanguage === 'polish' 
      ? '!!! ATTENTION !!! VERY IMPORTANT !!!\nGENERATE THIS ENTIRE RECIPE IN POLISH LANGUAGE ONLY.\nAll text must be in Polish, including recipe name, preparation time, ingredients, and instructions.\nUse proper Polish culinary terminology and measurements throughout.\n\n'
      : '!!! ATTENTION !!! VERY IMPORTANT !!!\nGENERATE THIS ENTIRE RECIPE IN ENGLISH LANGUAGE ONLY.\nAll text must be in English, including recipe name, preparation time, ingredients, and instructions.\nUse proper English culinary terminology and measurements throughout.\n\n';
      
    const languageReminder = outputLanguage === 'polish'
      ? '\n\n!!! FINAL REMINDER !!!\nTHE ENTIRE RECIPE MUST BE OUTPUT IN POLISH LANGUAGE ONLY.\nDo not include any English text.\nEnsure all measurements, ingredients, and cooking terms are in proper Polish.'
      : '\n\n!!! FINAL REMINDER !!!\nTHE ENTIRE RECIPE MUST BE OUTPUT IN ENGLISH LANGUAGE ONLY.\nEnsure all measurements, ingredients, and cooking terms are in proper English.';
    
    // Build the prompt with all options using the new template
    let promptSections = [`${languageInstructions}Generate a detailed recipe with the following specifications.`];
    
    // Only add sections that have actual values
    if (options.prepTime && options.prepTime !== 'any') {
      promptSections.push(`Preparation time: ${options.prepTime}`);
    }
    
    if (ingredientsPrompt) {
      promptSections.push(`Ingredients: ${ingredientsPrompt}`);
    }
    
    if (englishCuisine && englishCuisine !== 'any') {
      promptSections.push(`Cuisine: ${englishCuisine}`);
    }
    
    if (dietPrompt) {
      promptSections.push(`Dietary preferences: ${dietPrompt}`);
    }
    
    if (englishMealType && englishMealType !== 'any') {
      promptSections.push(`Meal type: ${englishMealType}`);
    }
    
    if (dietaryComponentsPrompt) {
      promptSections.push(`Dietary components: ${dietaryComponentsPrompt}`);
    }
    
    // Add seed and formatting instructions
    promptSections.push(`Use the variation seed ${options.randomSeed} to ensure the recipe is unique.`);
    promptSections.push(`Format the output as:
<recipe_name>
<prep_time>
<ingredients_needed>
<step_by_step_preparation>

Keep the recipe format clean and readable.${languageReminder}`);
    
    // Add diversity instructions
    promptSections.push(diversityInstructions);
    
    const prompt = promptSections.join('\n\n');

    // Create request data object
    const requestData = {
      diet: englishDiet,
      prepTime: options.prepTime,
      ingredients: options.ingredients,
      language: 'english', // Always use English for prompt language
      outputLanguage: outputLanguage, // Explicitly pass the desired output language
      mealType: englishMealType,
      cuisine: englishCuisine,
      useOnlySelected: options.useOnlySelected,
      prompt: prompt
    };
    
    return { prompt, requestData };
  };
  
  /**
   * Execute recipe generation request
   */
  const executeRecipeRequest = async (prompt: string, requestData: any): Promise<string> => {
    // Log the prompt for debugging in dev environment
    if (IS_DEV) {
      console.log("\n===== RECIPE GENERATION REQUEST =====");
      console.log("Recipe Parameters:", {
        diet: requestData.diet,
        prepTime: requestData.prepTime,
        ingredients: requestData.ingredients,
        mealType: requestData.mealType,
        cuisine: requestData.cuisine,
        outputLanguage: requestData.outputLanguage
      });
      console.log("\nGeneration Prompt:\n", prompt);
      console.log("===== END RECIPE GENERATION REQUEST =====\n");
    }
    
    const response = await axios.post(API_ENDPOINT, requestData);
    
    if (response.data && response.data.recipe) {
      return response.data.recipe;
    } else {
      throw new Error('Invalid response format');
    }
  };
  
  /**
   * Format dietary components for the prompt
   */
  const formatDietaryComponents = (dietaryComponents?: Record<string, { preference: string, amount?: number }>) => {
    if (!dietaryComponents || Object.keys(dietaryComponents).length === 0) {
      return '';
    }
    
    const includeComponents: string[] = [];
    const limitComponents: string[] = [];
    const excludeComponents: string[] = [];
    
    for (const [componentId, details] of Object.entries(dietaryComponents)) {
      // Convert component ID to proper display name
      const displayName = componentId.charAt(0).toUpperCase() + componentId.slice(1);
      
      if (details.preference === 'include') {
        if (details.amount) {
          includeComponents.push(`${displayName} (include approx. ${details.amount}g)`);
        } else {
          includeComponents.push(`${displayName} (include)`);
        }
      } else if (details.preference === 'limit') {
        if (details.amount) {
          limitComponents.push(`${displayName} (limit to max ${details.amount}g)`);
        } else {
          limitComponents.push(`${displayName} (limit)`);
        }
      } else if (details.preference === 'exclude') {
        excludeComponents.push(`${displayName} (strictly exclude)`);
      }
      // 'default' preference doesn't affect the recipe
    }
    
    // Combine all components into a single comma-separated list
    const allComponents = [...includeComponents, ...limitComponents, ...excludeComponents];
    
    if (allComponents.length > 0) {
      return allComponents.join(', ');
    }
    
    return '';
  };
  
  /**
   * Translate recipe to Polish
   */
  const translateRecipe = async (englishRecipe: string): Promise<string> => {
    const translationPrompt = `
      Translate the following recipe from English to Polish:
      - Translate the recipe name
      - Translate preparation time
      - Translate ALL ingredients and their measurements
      - Translate ALL steps and cooking instructions
      - Use proper Polish culinary terminology
      - Keep the same section tags (<recipe_name>, <prep_time>, etc.)
      
      Recipe to translate:
      ${englishRecipe}
    `;
    
    // Log translation prompt in dev environment
    if (IS_DEV) {
      console.log("\n===== TRANSLATION REQUEST =====");
      console.log("Language: polish");
      console.log("Translation Prompt:", translationPrompt);
      console.log("===== END TRANSLATION REQUEST =====\n");
    }
    
    try {
      const translationResponse = await axios.post(API_ENDPOINT, {
        prompt: translationPrompt,
        language: 'polish',
        isTranslation: true
      });
      
      if (translationResponse.data && translationResponse.data.recipe) {
        return translationResponse.data.recipe;
      } else {
        console.warn('Translation failed, using English recipe instead');
        return englishRecipe;
      }
    } catch (translationErr: any) {
      console.error('Translation request failed:', translationErr);
      console.warn('Translation failed, using English recipe instead');
      
      // If translation fails due to network error, log the translation prompt
      if (isServerUnavailable(translationErr)) {
        console.log("\n===== TRANSLATION REQUEST (Server unavailable) =====");
        console.log("Language: polish");
        console.log("Translation Prompt:", translationPrompt);
        console.log("===== END TRANSLATION REQUEST =====\n");
      }
      
      return englishRecipe;
    }
  };
  
  /**
   * Check if the error is due to server unavailability
   */
  const isServerUnavailable = (err: any): boolean => {
    return (
      err.code === 'ECONNREFUSED' || 
      err.code === 'ECONNABORTED' || 
      err.message?.includes('Network Error')
    );
  };
  
  /**
   * Handle server unavailable case - log prompt and return mock recipe
   */
  const handleServerUnavailable = (options: RecipeOptions, prompt: string): string => {
    console.log("\n===== RECIPE GENERATION REQUEST (Server unavailable) =====");
    console.log("Recipe Parameters:", {
      diet: options.diet,
      prepTime: options.prepTime,
      ingredients: options.ingredients,
      mealType: options.mealType,
      cuisine: options.cuisine,
      useOnlySelected: options.useOnlySelected,
    });
    console.log("\nGeneration Prompt:\n", prompt);
    console.log("===== END RECIPE GENERATION REQUEST =====\n");
    
    // Generate a mock recipe for testing
    const mockRecipe = createMockRecipe(options);
    
    setRecipe(mockRecipe);
    setError('Server unavailable. A mock recipe has been generated. Check console for prompt details.');
    return mockRecipe;
  };
  
  /**
   * Create a mock recipe for offline testing
   */
  const createMockRecipe = (options: RecipeOptions): string => {
    // Determine output language for the mock recipe
    const isPolish = options.displayLanguage === 'polish';
    
    return `
<recipe_name>
${options.cuisine ? options.cuisine.charAt(0).toUpperCase() + options.cuisine.slice(1) + ' ' : ''}${isPolish ? 'Przykładowy Przepis' : 'Mock Recipe'} ${options.randomSeed ? options.randomSeed % 1000 : Math.floor(Math.random() * 1000)}

<prep_time>
${isPolish ? 'Czas przygotowania: ' : 'Preparation time: '}${options.prepTime === 'quick' ? '15 minut' : 
  options.prepTime === 'medium' ? '45 minut' : 
  options.prepTime === 'long' ? '90 minut' : '30 minut'}

<ingredients_needed>
- ${isPolish ? 'Przykładowy składnik 1' : 'Mock ingredient 1'}
- ${isPolish ? 'Przykładowy składnik 2' : 'Mock ingredient 2'}
- ${isPolish ? 'Przykładowy składnik 3' : 'Mock ingredient 3'}
${options.ingredients && options.ingredients.length > 0 ? options.ingredients.map(ing => `- ${ing}`).join('\n') : ''}

<step_by_step_preparation>
1. ${isPolish ? 'To jest przykładowy przepis utworzony, ponieważ serwer jest niedostępny.' : 'This is a mock recipe created because the server is unavailable.'}
2. ${isPolish ? 'Zapytanie zostało zapisane w konsoli do celów testowych.' : 'The prompt has been logged to the console for testing.'}
3. ${isPolish ? 'Sprawdź konsolę deweloperską, aby zobaczyć pełne zapytanie.' : 'Check your developer console to see the complete prompt.'}
    `;
  };
  
  /**
   * Convert any Polish parameter values to English equivalents
   */
  const convertToEnglish = (paramValue?: string): string | undefined => {
    if (!paramValue) return undefined;
    
    // Diet conversions
    if (paramValue === 'wegetariańskie' || paramValue === 'wegetarianskie') return 'vegetarian';
    if (paramValue === 'wegańskie' || paramValue === 'weganskie') return 'vegan';
    if (paramValue === 'mięsne' || paramValue === 'miesne') return 'meat';
    if (paramValue === 'niski_indeks_glikemiczny') return 'low_gi';
    
    // Meal type conversions
    if (paramValue === 'śniadanie' || paramValue === 'sniadanie') return 'breakfast';
    if (paramValue === 'obiad') return 'dinner';
    if (paramValue === 'przekąska' || paramValue === 'przekaska') return 'snack';
    
    // Cuisine conversions
    if (paramValue === 'włoska' || paramValue === 'wloska') return 'italian';
    if (paramValue === 'polska') return 'polish';
    if (paramValue === 'meksykańska' || paramValue === 'meksykanska') return 'mexican';
    if (paramValue === 'azjatycka') return 'asian';
    if (paramValue === 'amerykańska' || paramValue === 'amerykanska') return 'american';
    if (paramValue === 'francuska') return 'french';
    
    // If not found in any conversion, return the original value
    return paramValue;
  };

  // Reset recipe state
  const resetRecipe = (): void => {
    setRecipe(null);
  };

  return {
    recipe,
    recipes,
    loading,
    error,
    generateRecipe,
    generateMultipleRecipes,
    resetRecipe,
    resetRecipes,
    toggleRecipeExpanded
  };
}; 