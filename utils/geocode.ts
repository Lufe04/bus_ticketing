export const getCoordinates = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SpotReserveApp/1.0 (contacto@tuemail.com)', // Reemplaza por algo tuyo si deseas
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error(`❌ Error al buscar coordenadas para ${address}:`, error);
    return null;
  }
};
