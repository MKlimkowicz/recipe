import { createContext, useContext, useState, useEffect } from 'react';
// We'll use a simple in-memory store for now
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
  isPolish: boolean;
  setIsPolish: (value: boolean) => void;
}

// Memory storage fallback
let languagePreference = false;

const LANGUAGE_STORAGE_KEY = 'app_language_setting';

export const LanguageContext = createContext<LanguageContextType>({
  isPolish: false,
  setIsPolish: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useLanguageProvider() {
  const [isPolish, setIsPolishState] = useState(languagePreference);

  useEffect(() => {
    // Load language preference on mount
    const loadLanguageSetting = async () => {
      try {
        // For now, just use the in-memory value
        // const storedSetting = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        // if (storedSetting !== null) {
        //   setIsPolishState(JSON.parse(storedSetting));
        // }
      } catch (error) {
        console.error('Error loading language setting:', error);
      }
    };

    loadLanguageSetting();
  }, []);

  const setIsPolish = async (value: boolean) => {
    setIsPolishState(value);
    // Save to in-memory storage
    languagePreference = value;
    // Save to persistent storage
    try {
      // await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };

  return { isPolish, setIsPolish };
} 