import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRouter } from 'expo-router';

export default function TripSummaryScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Resumen</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      {/* Contenido principal */}
      {/* Check icon */}
      <View style={styles.content}>
        <DotLottieReact
        src="https://lottie.host/2419a54d-fadf-49bb-ac69-d5f412f86701/rUjO7jDiHj.lottie"
        loop={false}
        autoplay
        style={{ width: 150, height: 150 }}
        />
        <Text style={styles.successText}>Viaje Finalizado</Text>
        <View style={styles.left}>
            <View style={styles.routeRow}>
                <Text style={styles.routeText}>Cúcuta</Text>
                <MaterialIcons name="east" size={25} /> 
                <Text style={styles.routeText}>Bucaramanga</Text>
            </View>
            <Text style={styles.dateText}>8 de Mayo de 2025</Text>
        </View>

        {/* Resumen de datos */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}><Text style={styles.label}>Hora de Salida</Text><Text style={styles.value}>6:12</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Hora de Llegada</Text><Text style={styles.value}>10:47</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Duración Total</Text><Text style={styles.value}>4:35</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Número de Pasajeros</Text><Text style={styles.value}>17</Text></View>
        </View>
      </View>

      {/* Botón Finalizar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.finalButton} onPress={() => router.push('/driver')}>
          <Text style={styles.finalButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7F8FA',
    },
    header: {
      backgroundColor: '#08173B',
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '400',
    },
    userCircle: {
      backgroundColor: '#FFFFFF',
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInitial: {
      color: '#08173B',
      fontWeight: '500',
      fontSize: 32,
    },
    content: {
      alignItems: 'center',
      padding: 20,
      paddingTop: 0,
    },
    successText: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 20,
      color: '#000',
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        gap: 12,
    },
    left: {
        alignItems: 'flex-start',  // alinea el contenido interno a la izquierda
        width: '100%',             // opcional, asegura el ancho completo del contenedor
    },      
    routeText: {
      fontSize: 25,
      fontWeight: '600',
      marginBottom: 4,
    },
    dateText: {
      fontSize: 20,
      color: '#989898',
      marginBottom: 30,
        fontWeight: '400',
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#000',
      alignSelf: 'flex-start',
      marginBottom: 15,
    },
    summaryCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      borderColor: '#D9D9D9',
      borderWidth: 1,
      width: '100%',
      padding: 16,
      gap: 12,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
    },
    value: {
      fontSize: 15,
      fontWeight: '400',
      color: '#000',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    finalButton: {
      backgroundColor: '#08173B',
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 14,
      width: '80%',
      alignItems: 'center',
    },
    finalButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 18,
    },
  });
  