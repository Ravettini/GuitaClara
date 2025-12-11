/**
 * Script de prueba para verificar la configuración de Gemini
 * 
 * Uso:
 *   tsx src/scripts/testGemini.ts
 * 
 * Requiere GEMINI_API_KEY en el archivo .env
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY no está configurada en el archivo .env');
    process.exit(1);
  }

  console.log('🔧 Inicializando cliente de Google GenAI...');
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  const testPrompt = 'Hola, ¿podés responderme en español argentino? Solo decime "Hola, funciono correctamente" si todo está bien.';

  try {
    console.log(`📤 Enviando prueba al modelo: ${DEFAULT_MODEL_ID}`);
    console.log(`📝 Prompt: "${testPrompt}"`);
    
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL_ID,
      contents: [
        {
          role: 'user',
          parts: [{ text: testPrompt }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    const text = response.text?.trim();

    if (!text) {
      console.error('❌ La respuesta no contiene texto');
      process.exit(1);
    }

    console.log('\n✅ ¡Éxito! La API está funcionando correctamente.\n');
    console.log('📥 Respuesta recibida:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('\n✨ Todo está configurado correctamente. Podés usar el asistente en la app.');
  } catch (error: any) {
    console.error('\n❌ Error al llamar a la API de Gemini:');
    console.error('─'.repeat(50));
    console.error('Mensaje:', error?.message);
    console.error('Status:', error?.status);
    console.error('StatusText:', error?.statusText);
    console.error('─'.repeat(50));
    
    if (error?.message?.includes('API_KEY') || error?.message?.includes('API key')) {
      console.error('\n💡 Sugerencia: Verificá que la API key sea válida en https://aistudio.google.com/');
    } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.error('\n💡 Sugerencia: El modelo puede no estar disponible. Verificá que el modelo esté correcto.');
    }
    
    process.exit(1);
  }
}

testGemini();

