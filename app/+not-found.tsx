import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotFoundScreen() {
  const { isPolish } = useLanguage();
  
  return (
    <>
      <Stack.Screen options={{ title: isPolish ? 'Ups!' : 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">
          {isPolish ? 'Ta strona nie istnieje.' : 'This screen doesn\'t exist.'}
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">
            {isPolish ? 'Wróć do strony głównej!' : 'Go to home screen!'}
          </ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
