# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Serverless Backend Setup

This application uses a serverless backend to generate recipes via OpenAI's API.

### Prerequisites

1. An AWS account
2. OpenAI API key
3. Node.js installed on your machine
4. Serverless Framework CLI (install with `npm install -g serverless`)

### Local Development

1. Set up your OpenAI API key:

```bash
export OPENAI_API_KEY=your_openai_api_key
```

2. Start the serverless API locally:

```bash
cd serverless
npm install
npm start
```

This will run the API on http://localhost:4000.

### Deployment

1. Configure your AWS credentials:

```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

2. Deploy to AWS:

```bash
cd serverless
npm run deploy
```

After deployment, update the production API endpoint in `hooks/useRecipeGeneration.js` with your AWS API Gateway URL.

## Using the Recipe Generation API

The app includes a custom hook `useRecipeGeneration` for easy integration with React components.

Example usage:

```jsx
import { useRecipeGeneration } from '@/hooks/useRecipeGeneration';

function RecipeGenerator() {
  const { recipe, loading, error, generateRecipe } = useRecipeGeneration();

  const handleGenerateRecipe = async () => {
    try {
      await generateRecipe({
        ingredients: ['chicken', 'rice', 'vegetables'],
        cuisine: 'Italian',
        dietary: ['gluten-free'],
        mealType: 'dinner'
      });
    } catch (error) {
      console.error('Failed to generate recipe:', error);
    }
  };

  return (
    // Your component JSX
  );
}
```
