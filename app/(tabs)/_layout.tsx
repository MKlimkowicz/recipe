import React from 'react';
import { Platform, PressableStateCallbackType, View, Text as TextBase, GestureResponderEvent } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ModernButton, ModernButtonProps } from './index';
import LinearGradient from 'react-native-linear-gradient';
import type { LinearGradientProps as BaseLinearGradientProps } from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Extend LinearGradientProps to ensure compatibility with React Native
interface ExtendedLinearGradientProps extends BaseLinearGradientProps {
  children?: React.ReactNode;
}

// Cast LinearGradient as a React component with the extended props
const Gradient = LinearGradient as unknown as React.ComponentType<ExtendedLinearGradientProps>;

// Type assertion for Text to bypass the TypeScript error
const Text = TextBase as any;

export default function TabsLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        tabBarStyle: Platform.OS === 'ios' ? {
          height: 90,
          paddingBottom: 30,
          paddingHorizontal: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        } : {
          height: 70,
          paddingHorizontal: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={28} color={color} />,
          tabBarButton: (props) => (
            <ModernButton
              onPress={(event: GestureResponderEvent) => props.onPress?.(event)} 
              gradientColors={props.accessibilityState?.selected ? ['#3b82f6', '#1d4ed8'] : ['#6b7280', '#4b5563']}
              style={{ flex: 1, marginHorizontal: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name="restaurant-outline"
                  size={28}
                  color="#fff"
                />
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: '600',
                    textShadowColor: 'rgba(0, 0, 0, 0.25)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {props.accessibilityState?.selected ? 'GENERATE' : 'Generate'}
                </Text>
              </View>
            </ModernButton>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved Recipes',
          tabBarIcon: ({ color }) => <FontAwesome name="bookmark" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}