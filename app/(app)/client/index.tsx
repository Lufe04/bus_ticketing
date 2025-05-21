import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ClienteHome = () => {
  const [fromLocation, setFromLocation] = useState('CSA');
  const [toLocation, setToLocation] = useState('CSA');
  const [departingDate, setDepartingDate] = useState('28 abr 2025');
  const [returningDate, setReturningDate] = useState('Opcional');
  const [passengerCount, setPassengerCount] = useState('1 Pasajero');

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Usuario</Text>
          <Text style={styles.subGreeting}>¿Listo para tu próximo viaje?</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>U</Text>
        </View>
      </View>

      {/* Search Form */}
      <View style={styles.formContainer}>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Desde</Text>
            <TextInput
              style={styles.input}
              value={fromLocation}
              onChangeText={setFromLocation}
            />
            <Text style={styles.inputSubtext}>Ciudad, Estación o Aeropuerto</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hasta</Text>
            <TextInput
              style={styles.input}
              value={toLocation}
              onChangeText={setToLocation}
            />
            <Text style={styles.inputSubtext}>Ciudad, Estación o Aeropuerto</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de salida</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#777" />
              <Text style={styles.dateText}>{departingDate}</Text>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de regreso</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#777" />
              <Text style={styles.dateText}>{returningDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.passengerContainer}>
          <Text style={styles.label}>Pasajeros</Text>
          <View style={styles.passengerSelector}>
            <Ionicons name="people-outline" size={20} color="#777" />
            <Text style={styles.passengerText}>{passengerCount}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Tickets Section */}
      <View style={styles.ticketsHeader}>
        <Text style={styles.ticketsTitle}>Tus Tiquetes</Text>
        <Ionicons name="arrow-forward" size={24} color="#000" />
      </View>

      {/* Ticket Card */}
      <View style={styles.ticketCard}>
        <View style={styles.ticketInfo}>
          <View style={styles.ticketRow}>
            <Ionicons name="bus-outline" size={20} color="#555" />
            <Text style={styles.ticketText}>Montería → Sincelejo</Text>
          </View>
          
          <View style={styles.ticketRow}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.ticketText}>28 Abr 2025</Text>
          </View>
          
          <View style={styles.ticketRow}>
            <Ionicons name="person-outline" size={20} color="#555" />
            <Text style={styles.ticketText}>1 Asiento</Text>
          </View>
          
          <View style={styles.ticketRow}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.ticketText}>6:00 a.m.</Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrBackground}>
            <Ionicons name="qr-code" size={60} color="#333" />
          </View>
        </View>
      </View>

      {/* Space at bottom to avoid content being hidden by bottom nav */}
      <View style={styles.bottomPadding} />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#14192e',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
    marginTop: 15,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputContainer: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputSubtext: {
    fontSize: 12,
    color: '#999',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  passengerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  passengerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#14192e',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  ticketsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  ticketInfo: {
    flex: 3,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketText: {
    marginLeft: 10,
    fontSize: 16,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBackground: {
    backgroundColor: '#80d970',
    borderRadius: 8,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  bottomPadding: {
    height: 70,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  activeNavText: {
    color: '#4a9bff',
  },
});

export default ClienteHome;