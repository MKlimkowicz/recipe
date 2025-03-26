const { OpenAI } = require('openai');

/**
 * AWS Lambda function for generating recipes using OpenAI's API
 * 
 * @param {Object} event - AWS Lambda event object
 * @returns {Object} Lambda response with recipe data
 */
exports.handler = async (event) => {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { 
      diet = '', // 'vegetarian', 'vegan', or empty string
      prepTime = 'any', // 'any', 'quick', 'medium', 'long'
      ingredients = [],
      language = 'english', // 'english' or 'polish'
      outputLanguage = '', // Desired output language, overrides language for final recipe
      mealType = '', // 'breakfast', 'lunch', 'dinner', 'snack', or empty string
      isTranslation = false, // Flag to indicate if this is a translation request
      prompt = '' // Client-provided prompt (when present)
    } = body;
    
    // Language-specific templates and messages
    const templates = {
      english: {
        formatPrompt: `Format the response exactly using this template format without any additional formatting characters, markdown syntax, or decorations:
<recipe_name>
<prep_time>
<ingredients_needed>
<step_by_step_preparation>

Please fill in each section with the appropriate content, keeping it concise. Do not add *, #, or any other formatting characters.`,
        systemMessage: "You are a chef who creates practical recipes. You MUST follow the exact template format provided, filling in each section with appropriate content. Do not add any additional sections, formatting, markdown syntax, asterisks, hashtags, or similar characters. IMPORTANT: You MUST generate the recipe in the language requested in the prompt. If asked for Polish, write the entire recipe in Polish."
      },
      polish: {
        formatPrompt: `Sformatuj odpowiedź dokładnie według tego szablonu, bez żadnych dodatkowych znaków formatowania, składni markdown czy dekoracji:
<nazwa_przepisu>
<czas_przygotowania>
<potrzebne_składniki>
<przygotowanie_krok_po_kroku>

Proszę wypełnić każdą sekcję odpowiednią treścią, zachowując zwięzłość. Nie dodawaj *, #, ani innych znaków formatowania.`,
        systemMessage: "Jesteś kucharzem, który tworzy praktyczne przepisy. MUSISZ przestrzegać dokładnego formatu szablonu, wypełniając każdą sekcję odpowiednią treścią. Nie dodawaj żadnych dodatkowych sekcji, formatowania, składni markdown, gwiazdek, hashtagów ani podobnych znaków. WAŻNE: MUSISZ wygenerować przepis w języku wskazanym w prośbie. Jeśli prośba jest o przepis po polsku, napisz CAŁY przepis po polsku."
      }
    };
    
    // If client provided a complete prompt, use it directly
    let generationPrompt = '';
    
    // Determine which language to use for the output
    // Order of precedence: outputLanguage > language
    const selectedLanguage = (outputLanguage || language || 'english').toLowerCase();
    const isPolish = selectedLanguage === 'polish';
    
    if (prompt) {
      // Use the client-provided prompt directly
      generationPrompt = prompt;
    } else {
      // Create a new prompt based on parameters
      // Translation requests have their own format
      if (isTranslation) {
        generationPrompt = body.prompt || '';
      } else {
        // Start with a base prompt
        generationPrompt = isPolish
          ? `Stwórz przepis`
          : `Create a recipe`;
        
        // Handle diet
        if (diet === 'vegetarian') {
          generationPrompt += isPolish
            ? ` wegetariański`
            : ` that is vegetarian`;
        } else if (diet === 'vegan') {
          generationPrompt += isPolish
            ? ` wegański`
            : ` that is vegan`;
        }
        
        // Handle meal type
        if (mealType === 'breakfast') {
          generationPrompt += isPolish
            ? ` na śniadanie`
            : ` for breakfast`;
        } else if (mealType === 'lunch') {
          generationPrompt += isPolish
            ? ` na lunch`
            : ` for lunch`;
        } else if (mealType === 'dinner') {
          generationPrompt += isPolish
            ? ` na obiad`
            : ` for dinner`;
        } else if (mealType === 'snack') {
          generationPrompt += isPolish
            ? ` jako przekąskę`
            : ` as a snack`;
        }
        // If mealType is empty, no meal type is specified
        
        // Handle preparation time
        if (prepTime === 'quick') {
          generationPrompt += isPolish
            ? ` którego przygotowanie zajmuje mniej niż 20 minut` 
            : ` that takes less than 20 minutes to prepare`;
        } else if (prepTime === 'medium') {
          generationPrompt += isPolish
            ? ` którego przygotowanie zajmuje od 20 do 60 minut` 
            : ` that takes between 20-60 minutes to prepare`;
        } else if (prepTime === 'long') {
          generationPrompt += isPolish
            ? ` którego przygotowanie zajmuje ponad 1 godzinę` 
            : ` that takes over 1 hour to prepare`;
        }
        
        // Handle ingredients
        if (ingredients.length > 0) {
          const ingredientsList = ingredients.join(', ');
          generationPrompt += isPolish
            ? ` używając tych składników: ${ingredientsList}` 
            : ` using these ingredients: ${ingredientsList}`;
        }
        
        // Add format prompt
        generationPrompt += '. ' + templates[selectedLanguage].formatPrompt;
      }
    }
    
    // Call OpenAI API with faster model and limited tokens
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using 3.5 turbo for faster responses
      messages: [
        { 
          role: "system", 
          content: templates[selectedLanguage].systemMessage
        },
        { 
          role: "user", 
          content: generationPrompt 
        }
      ],
      temperature: 0.3, // Reduced from 0.7 to improve consistency and precision
      max_tokens: 500, // Reducing token count for faster responses
      presence_penalty: -0.1, // Slightly reduce repetition
    });
    
    // Extract generated recipe
    const recipeText = response.choices[0].message.content;
    
    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For CORS support
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        recipe: recipeText,
        prompt: generationPrompt,
        language: selectedLanguage
      })
    };
  } catch (error) {
    console.error('Error generating recipe:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        error: 'Failed to generate recipe',
        message: error.message
      })
    };
  }
}; 