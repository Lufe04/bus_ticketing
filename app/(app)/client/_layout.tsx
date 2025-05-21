import React from 'react';
import { Stack, Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

// Constantes para colores consistentes
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  white: '#FFFFFF',
};

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.skyBlue,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      {/* Inicio (Home) Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Saldo (Balance) Tab */}
      <Tabs.Screen
        name="saldoScreen"
        options={{
          title: "Saldo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Mapa (Map) Tab */}
      <Tabs.Screen
        name="mapScreen"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Chat Tab */}
      <Tabs.Screen
        name="chatScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Screens that don't appear in tabs but need to be accessible */}
      <Tabs.Screen
        name="selectScreen"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
      
      <Tabs.Screen
        name="ticketsScreen"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
    </Tabs>
  );
}