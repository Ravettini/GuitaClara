import axios from 'axios';

// API gratuita para cotización del dólar en Argentina
const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/oficial';

interface ExchangeRate {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

// Obtener cotización del dólar oficial
export const getOfficialDollarRate = async (): Promise<number | null> => {
  try {
    const response = await axios.get<ExchangeRate>(DOLAR_API_URL, {
      timeout: 5000,
    });

    if (response.data && response.data.venta) {
      // Usamos el precio de venta (compra del dólar)
      return response.data.venta;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching dollar rate:', error.message);
    
    // Fallback: intentar con otra API alternativa
    try {
      const altResponse = await axios.get('https://api.bluelytics.com.ar/v2/latest', {
        timeout: 5000,
      });
      
      if (altResponse.data?.oficial?.value_sell) {
        return altResponse.data.oficial.value_sell;
      }
    } catch (altError) {
      console.error('Error fetching from alternative API:', altError);
    }
    
    return null;
  }
};

// Obtener cotización con cache (para evitar demasiadas llamadas)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export const getCachedDollarRate = async (): Promise<number | null> => {
  const now = Date.now();
  
  // Si tenemos un rate cacheado y no ha expirado, usarlo
  if (cachedRate && (now - cachedRate.timestamp) < CACHE_DURATION) {
    return cachedRate.rate;
  }

  // Obtener nuevo rate
  const rate = await getOfficialDollarRate();
  
  if (rate) {
    cachedRate = { rate, timestamp: now };
  }
  
  return rate;
};


