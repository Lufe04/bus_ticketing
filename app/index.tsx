import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, ImageBackground } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// Obtener dimensiones del dispositivo para diseño responsive
const { width, height } = Dimensions.get('window');

// Paleta de colores
const COLORS = {
  skyBlue: '#20ADF5',
  midnightBlue: '#1A2E46',
  gray: '#989898',
  white: '#FFFFFF'
};

export default function Index() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  
  // Datos de los slides con títulos y descripciones
  const slides: { title: string; description: string; icon: "bus-outline" | "ticket-outline" | "location-outline" | "map-outline"; iconSize: number }[] = [
    {
      title: "Bienvenido a Rutiq",
      description: "Tu compañero de viaje en transporte público",
      icon: 'bus-outline',
      iconSize: 120
    },
    {
      title: "Compra tus pasajes",
      description: "Compra tu pasaje de bus con anticipación y sin hacer colas",
      icon: 'ticket-outline',
      iconSize: 100
    },
    {
      title: "Rastreo en tiempo real",
      description: "Mira por donde va tu bus para no esperar más tiempo del deseado en el paradero",
      icon: 'location-outline',
      iconSize: 100
    },
    {
      title: "Planifica tus rutas",
      description: "Planea tus rutas para saber que bus agendar",
      icon: 'map-outline',
      iconSize: 100
    }
  ];

  // Función para navegar a la pantalla de autenticación
  const navigateToAuth = () => {
    router.push('/auth');
  };

  // Función para avanzar al siguiente slide
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Renderizar indicadores de posición (dots)
  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentSlide ? COLORS.skyBlue : COLORS.gray }
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <View style={styles.slideContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={slides[currentSlide].icon} 
              size={slides[currentSlide].iconSize} 
              color={COLORS.skyBlue} 
            />
          </View>

          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
          
          {renderDots()}
          
          <View style={styles.navigationContainer}>
            {currentSlide < slides.length - 1 ? (
              <>
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={navigateToAuth} style={styles.skipContainer}>
                  <Text style={styles.skipText}>Omitir</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={navigateToAuth} style={styles.getStartedButton}>
                <Text style={styles.getStartedButtonText}>¡Comenzar!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    width: width * 0.7,
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.midnightBlue,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.gray,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 20,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipContainer: {
    padding: 10,
  },
  skipText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  getStartedButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  getStartedButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});