import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
      <Stack
      screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="client"/>
        <Stack.Screen name="driver"/>
      </Stack>
  )
}