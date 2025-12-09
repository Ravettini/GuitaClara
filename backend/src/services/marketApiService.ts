import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Mapeo de tickers argentinos comunes
const ARGENTINE_TICKERS: Record<string, string> = {
  'GGAL': 'GGAL.BA',
  'YPFD': 'YPFD.BA',
  'PAMP': 'PAMP.BA',
  'MIRG': 'MIRG.BA',
  'TXAR': 'TXAR.BA',
  // Agregar más según necesites
};

interface MarketData {
  price: number;
  currency: string;
  name?: string;
  exchange?: string;
}

// Obtener precio desde Alpha Vantage
export const getPriceFromAlphaVantage = async (
  ticker: string,
  market: string
): Promise<MarketData | null> => {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    // Para tickers argentinos, usar el formato .BA
    const searchTicker = market === 'BCBA' || market === 'BYMA' 
      ? ARGENTINE_TICKERS[ticker.toUpperCase()] || `${ticker.toUpperCase()}.BA`
      : ticker.toUpperCase();

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: searchTicker,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 5000,
    });

    if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
      const price = parseFloat(response.data['Global Quote']['05. price']);
      const currency = market === 'BCBA' || market === 'BYMA' ? 'ARS' : 'USD';
      
      return {
        price,
        currency,
        name: response.data['Global Quote']['01. symbol'],
        exchange: market,
      };
    }

    return null;
  } catch (error: any) {
    console.error(`Error fetching price for ${ticker}:`, error.message);
    return null;
  }
};

// Obtener precio desde Yahoo Finance (alternativa gratuita)
export const getPriceFromYahoo = async (
  ticker: string,
  market: string
): Promise<MarketData | null> => {
  try {
    // Para tickers argentinos
    const yahooTicker = market === 'BCBA' || market === 'BYMA'
      ? `${ticker.toUpperCase()}.BA`
      : ticker.toUpperCase();

    // Usar API pública de Yahoo Finance (puede tener rate limits)
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}`,
      {
        params: {
          interval: '1d',
          range: '1d',
        },
        timeout: 5000,
      }
    );

    if (response.data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const price = response.data.chart.result[0].meta.regularMarketPrice;
      const currency = market === 'BCBA' || market === 'BYMA' ? 'ARS' : 'USD';
      const name = response.data.chart.result[0].meta.longName || ticker;

      return {
        price,
        currency,
        name,
        exchange: market,
      };
    }

    return null;
  } catch (error: any) {
    console.error(`Error fetching price from Yahoo for ${ticker}:`, error.message);
    return null;
  }
};

// Obtener precio (intenta múltiples fuentes)
export const getMarketPrice = async (
  ticker: string,
  market: string
): Promise<MarketData | null> => {
  // Intentar Yahoo primero (gratis, sin API key)
  const yahooPrice = await getPriceFromYahoo(ticker, market);
  if (yahooPrice) return yahooPrice;

  // Si falla, intentar Alpha Vantage
  if (ALPHA_VANTAGE_API_KEY) {
    const alphaPrice = await getPriceFromAlphaVantage(ticker, market);
    if (alphaPrice) return alphaPrice;
  }

  return null;
};


