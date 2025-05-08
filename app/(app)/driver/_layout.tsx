import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
  return (
    <Stack
            screenOptions={{ headerShown: false }} 
          >
            <Stack.Screen name="index"/>
            <Stack.Screen name="routes"/>
            <Stack.Screen name="history"/>
            <Stack.Screen name="boarding"/>
            <Stack.Screen name="scan"/>
            <Stack.Screen name="route"/>
            <Stack.Screen name="routeMap"/>
            <Stack.Screen name="summary"/>
    </Stack>
  )
}
