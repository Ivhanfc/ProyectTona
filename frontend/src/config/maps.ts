/**
 * Centralized Google Maps Configuration
 * Reads the API Key securely from environment variables (.env)
 */

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'AIzaSyC7takF6D12i_1Nm_dtgeUevrWM1a_gi_g') {
    console.warn(
        '[Maps Config] Advertencia: No se ha configurado EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env'
    );
}

export default {
    apiKey: GOOGLE_MAPS_API_KEY,
};
