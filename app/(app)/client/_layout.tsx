import { Stack } from "expo-router";
import React from 'react';

export default function RootLayout() {
  return (
      <Stack
      screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="index"/>
        <Stack.Screen name="mapScreen"/>
        <Stack.Screen name="saldoScreen"/>
        <Stack.Screen name="selectScreen"/>
        <Stack.Screen name="favoriteScreen"/>
        <Stack.Screen name="chatScreen"/>
        <Stack.Screen name="ticketsScreen"/>
      </Stack>
  )
}