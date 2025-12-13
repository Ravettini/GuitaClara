import { GoogleGenAI } from '@google/genai';
import * as analyticsService from './analyticsService';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const DISCLAIMER = '⚠️ Esto no es asesoramiento financiero profesional. Son sugerencias generales basadas en tus datos. Ante dudas importantes, consultá con un/a profesional.';

// Choose model via env var. Default: Gemma 3 (higher free-tier limits, ~14.4K requests/day).
// Must include -it suffix for instruction-tuned models.
const DEFAULT_MODEL_ID = process.env.AI_MODEL ?? 'gemma-3-4b-it';

// Intent detection types
type AssistantIntent =
  | 'overview'
  | 'spending'
  | 'investments'
  | 'fixed-deposits'
  | 'savings'
  | 'small-talk'
  | 'other';

// Detect the intent of the user's question
function detectIntent(userPrompt: string): AssistantIntent {
  const text = userPrompt.toLowerCase();

  if (
    text.includes('en qué gasto') ||
    text.includes('en que gasto') ||
    text.includes('gasto más') ||
    text.includes('gasto mas') ||
    text.includes('gastos') ||
    text.includes('en qué categoría') ||
    text.includes('en que categoria')
  ) {
    return 'spending';
  }

  if (
    text.includes('inversiones') ||
    text.includes('invertir') ||
    text.includes('portfolio') ||
    text.includes('cedear') ||
    text.includes('acciones')
  ) {
    return 'investments';
  }

  if (
    text.includes('plazo fijo') ||
    text.includes('plazos fijos') ||
    text.includes('plazo fijos')
  ) {
    return 'fixed-deposits';
  }

  if (
    text.includes('ahorrar') ||
    text.includes('ahorro') ||
    text.includes('cómo puedo ahorrar') ||
    text.includes('como puedo ahorrar')
  ) {
    return 'savings';
  }

  if (
    text.includes('nicki nicole') ||
    text.includes('el pepe') ||
    text.includes('ete sech') ||
    text.includes('soy de china') ||
    text.includes('lalalala') ||
    (text.includes('hola') && !text.includes('plata') && !text.includes('finanzas'))
  ) {
    return 'small-talk';
  }

  // Pregunta genérica tipo "¿Cómo estoy?", "¿Qué opinás de mis finanzas?"
  if (
    text.includes('cómo estoy') ||
    text.includes('como estoy') ||
    text.includes('qué opinás') ||
    text.includes('que opinas') ||
    text.includes('situación financiera') ||
    text.includes('situacion financiera')
  ) {
    return 'overview';
  }

  return 'other';
}

interface FinancialSnapshot {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savingsRate: number;
    netWorth: number;
  };
  expensesByCategory: Array<{
    categoryName: string;
    total: number;
    percentage: number;
  }>;
  incomeVsExpense: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
  investments: {
    fixedTerms: {
      count: number;
      totalValue: number;
    };
    portfolio: {
      count: number;
      totalValue: number;
    };
  };
}

async function getFinancialSnapshot(userId: string): Promise<FinancialSnapshot> {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Obtener resumen del último mes
  const summary = await analyticsService.getSummary(userId, {
    startDate: lastMonth,
    endDate: now,
  });

  // Obtener gastos por categoría
  const expensesByCategory = await analyticsService.getExpensesByCategory(userId, {
    startDate: lastMonth,
    endDate: now,
  });

  // Obtener ingresos vs gastos diarios
  const incomeVsExpense = await analyticsService.getIncomeVsExpense(userId, {
    startDate: lastMonth,
    endDate: now,
  });

  // Obtener inversiones
  const fixedTerms = await prisma.fixedTermDeposit.findMany({
    where: { userId },
    select: {
      principalAmount: true,
      computedInterestAmount: true,
      currency: true,
    },
  });

  const positions = await prisma.investmentPosition.findMany({
    where: { userId },
    select: {
      quantity: true,
      averageBuyPrice: true,
      instrument: {
        select: {
          currency: true,
        },
      },
    },
  });

  const fixedTermsTotal = fixedTerms.reduce((sum, ft) => {
    const principal = Number(ft.principalAmount);
    const interest = Number(ft.computedInterestAmount);
    return sum + principal + interest;
  }, 0);

  const portfolioTotal = positions.reduce((sum, pos) => {
    const value = Number(pos.quantity) * Number(pos.averageBuyPrice);
    return sum + value;
  }, 0);

  return {
    summary: {
      totalIncome: Number(summary.totalIncome) + Number(summary.totalIncomeUSD),
      totalExpenses: Number(summary.totalExpenses) + Number(summary.totalExpensesUSD),
      balance: Number(summary.balance) + Number(summary.balanceUSD),
      savingsRate: summary.savingsRate,
      netWorth: Number(summary.netWorth) + Number(summary.netWorthUSD),
    },
    expensesByCategory: expensesByCategory.map(cat => ({
      categoryName: cat.categoryName,
      total: Number(cat.total),
      percentage: cat.percentage,
    })),
    incomeVsExpense: incomeVsExpense.slice(-30), // Últimos 30 días
    investments: {
      fixedTerms: {
        count: fixedTerms.length,
        totalValue: fixedTermsTotal,
      },
      portfolio: {
        count: positions.length,
        totalValue: portfolioTotal,
      },
    },
  };
}

export async function askFinancialAssistant(
  userId: string,
  message: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new AppError(
      500,
      'GEMINI_API_KEY no está configurada en las variables de entorno. Por favor, configurá la API key en el archivo .env del backend.'
    );
  }

  // Inicializar cliente del nuevo SDK
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  // Obtener snapshot financiero
  let snapshot: FinancialSnapshot;
  try {
    snapshot = await getFinancialSnapshot(userId);
  } catch (error: any) {
    console.error('Error getting financial snapshot:', error);
    throw new AppError(500, 'Error al obtener tus datos financieros. Por favor, intentá de nuevo.');
  }

  // VALIDACIÓN CRÍTICA: Verificar si hay datos reales
  const hasRealData = 
    snapshot.summary.totalIncome > 0 ||
    snapshot.summary.totalExpenses > 0 ||
    snapshot.expensesByCategory.length > 0 ||
    snapshot.investments.fixedTerms.count > 0 ||
    snapshot.investments.portfolio.count > 0;

  // Si no hay datos reales, responder directamente sin llamar a la IA
  if (!hasRealData) {
    return `Hola! 👋

Todavía no tenés datos registrados en GuitaClara. Para que pueda ayudarte con tus finanzas, necesitás:

• Registrar algunos ingresos o gastos
• Crear categorías en la sección "Más"
• Agregar transacciones en "Transacciones"

Una vez que tengas datos, podré darte análisis y recomendaciones personalizadas.

${DISCLAIMER}`;
  }

  // Detectar si la pregunta menciona a otra persona
  const messageLower = message.toLowerCase();
  const commonNames = ['ezequiel', 'paolillo', 'juan', 'maria', 'carlos', 'ana', 'pedro', 'laura'];
  const mentionsOtherPerson = commonNames.some(name => messageLower.includes(name)) && 
    !messageLower.includes('yo') && 
    !messageLower.includes('mi') && 
    !messageLower.includes('mis') &&
    !messageLower.includes('mío') &&
    !messageLower.includes('mía');

  if (mentionsOtherPerson) {
    return `Hola! 👋

Solo puedo ayudarte con tus propios datos financieros registrados en GuitaClara. No tengo acceso a información de otras personas.

Si querés analizar tus finanzas, podés preguntarme cosas como:
• "¿En qué gasto más este mes?"
• "¿Cuál es mi balance actual?"
• "¿Cómo puedo ahorrar más?"

${DISCLAIMER}`;
  }

  // Detectar la intención de la pregunta
  const intent = detectIntent(message);

  // Construir instrucción de tarea según la intención
  let taskInstruction: string;

  switch (intent) {
    case 'spending':
      taskInstruction = `
La persona te está preguntando específicamente por sus GASTOS.

Tu tarea principal:
- Explicá en qué está gastando más este mes.
- Mencioná las 2–3 categorías principales de gasto y su peso aproximado.
- No repitas todo el análisis general, solo lo necesario para responder a esa pregunta.
`.trim();
      break;

    case 'investments':
      taskInstruction = `
La persona te está preguntando específicamente por sus INVERSIONES.

Tu tarea principal:
- Hacé un breve resumen del estado de sus inversiones.
- Comentá riesgos generales y si están equilibradas o concentradas.
- No vuelvas a explicar todo su presupuesto ni todos los gastos.
`.trim();
      break;

    case 'fixed-deposits':
      taskInstruction = `
La persona te está preguntando específicamente por sus PLAZOS FIJOS.

Tu tarea principal:
- Comentá brevemente el rol de los plazos fijos en su situación actual.
- Explicá beneficios y limitaciones de seguir usando plazos fijos en su contexto.
- No hagas otra vez todo el diagnóstico general completo, solo lo justo.
`.trim();
      break;

    case 'savings':
      taskInstruction = `
La persona te está preguntando cómo AHORRAR.

Tu tarea principal:
- Explicá 2–3 ideas concretas para que pueda ahorrar más, en función de sus números.
- No repitas en detalle todas las categorías, solo las más relevantes para tus consejos.
`.trim();
      break;

    case 'small-talk':
      taskInstruction = `
La persona está haciendo una pregunta o comentario más informal o de chiste.

Tu tarea:
- Respondé con UNA frase corta y simpática.
- Luego, en 2–3 viñetas, ofrecé volver al tema de sus finanzas o sugerí una pregunta útil.
- No hagas un análisis financiero largo en este caso.
`.trim();
      break;

    case 'overview':
      taskInstruction = `
La persona te está pidiendo una visión general de su situación financiera.

Tu tarea:
- Hacé un resumen global del mes (ingresos, gastos, ahorro).
- Marcá 3–4 puntos clave.
- NO repitas este análisis en cada respuesta si luego te hace preguntas específicas.
`.trim();
      break;

    case 'other':
    default:
      taskInstruction = `
La persona hace una pregunta relacionada con finanzas o con sus datos.

Tu tarea:
- Respondé de forma específica a lo que pregunta.
- Usá sus datos solo como contexto, sin repetir siempre el mismo análisis completo.
`.trim();
      break;
  }

  // Construir system prefix con instrucciones actualizadas
  const systemPrefix = `Sos el asistente financiero de GuitaClara, una app de finanzas personales para Argentina y Latam.

Reglas generales:
- Respondé SIEMPRE en español claro, cercano y respetuoso.
- Máximo 300 palabras por respuesta.
- Organizá la respuesta en esta estructura cuando sea posible:
  1) Un resumen en 1 o 2 frases.
  2) 3 a 5 viñetas con los hallazgos principales.
  3) 3 a 5 viñetas con recomendaciones concretas.

⚠️ REGLA CRÍTICA - NUNCA INVENTES DATOS:
- SOLO podés usar los datos que están en el contexto JSON que te proporciono.
- Si un dato NO está en el contexto JSON, NO existe. NO lo inventes.
- Si no hay gastos en una categoría, NO digas que hay gastos ahí.
- Si no hay inversiones, NO digas que hay inversiones.
- Si no hay datos de un mes específico, NO inventes porcentajes ni montos.
- Si la pregunta menciona a otra persona (que no sea el usuario), decí claramente que solo podés ayudar con los datos del usuario autenticado.
- Si no tenés suficientes datos para responder, decilo EXPLÍCITAMENTE: "No tengo suficientes datos para responder esa pregunta" o "No hay información registrada sobre eso".

MUY IMPORTANTE:
- LEÉ con atención la pregunta del usuario y tu instrucción de tarea.
- Respondé SIEMPRE a lo que te preguntan, no des el mismo análisis genérico en todas las respuestas.
- No repitas en cada respuesta el diagnóstico completo de su mes. Solo usá esos datos cuando sean relevantes para la pregunta.
- Evitá introducir siempre con el mismo texto (por ejemplo "en resumen, tu situación presenta un déficit considerable…").
- Cuando la persona pregunte por una categoría específica (gastos, inversiones, plazos fijos, ahorro), enfocate SOLO en eso.
- Si hace chistes o comentarios tipo "el pepe", "nicki nicole", etc., respondé corto y simpático y ofrecé volver al tema financiero.

Recordá:
- La pregunta del usuario es TU guía principal.
- Los datos de GuitaClara son contexto para dar ejemplos y reforzar tus recomendaciones.
- Si un dato NO está en el JSON, NO existe. NO lo inventes bajo ninguna circunstancia.

REGLAS IMPORTANTES:
- Hablá en español argentino, con un tono cercano pero profesional.
- Nunca des órdenes tajantes como "comprá X" o "vendé todo".
- Usá frases como "podrías considerar...", "quizás te convenga revisar...", "sería bueno evaluar...".
- Nunca prometas rendimientos específicos ni garantices resultados.
- Sé empático y constructivo.
- Si no hay suficientes datos en el JSON, decilo claramente y NO inventes nada.`.trim();

  // Construir prompt completo con contexto, instrucción de tarea y pregunta del usuario
  const financialContextText = JSON.stringify(snapshot, null, 2);
  
  const fullPrompt = `
${systemPrefix}

⚠️ DATOS FINANCIEROS DEL USUARIO (SOLO USA ESTOS DATOS, NO INVENTES NADA):
${financialContextText}

IMPORTANTE: Si un dato NO está en el JSON de arriba, NO existe. NO lo inventes. Si no hay información sobre algo, decilo claramente.

Instrucción de tarea para esta respuesta:
${taskInstruction}

Consulta literal del usuario:
"${message}"

RECORDÁ: Solo podés usar los datos que están en el JSON. Si algo no está ahí, NO existe. NO lo inventes.
`.trim();

  try {
    // DEBUG: Optional - log a non-streaming response to inspect finishReason & parts
    // Comment out this block after inspection to avoid duplicate API calls
    // if (process.env.NODE_ENV !== 'production') {
    //   const debugResponse = await ai.models.generateContent({
    //     model: DEFAULT_MODEL_ID,
    //     contents: [
    //       {
    //         role: 'user',
    //         parts: [{ text: fullPrompt }],
    //       },
    //     ],
    //     config: {
    //       temperature: 0.7,
    //       maxOutputTokens: 400,
    //     },
    //   });
    //   console.log('[DEBUG] ===== FULL RESPONSE STRUCTURE (non-streaming) =====');
    //   console.log('[DEBUG] Model:', DEFAULT_MODEL_ID);
    //   console.dir(debugResponse, { depth: null });
    //   if (debugResponse.candidates?.[0]) {
    //     console.log('[DEBUG] finishReason:', debugResponse.candidates[0].finishReason);
    //     console.log('[DEBUG] content.parts:', debugResponse.candidates[0].content?.parts);
    //   }
    //   console.log('[DEBUG] ===== END DEBUG RESPONSE =====');
    // }

    // Use streaming to accumulate all text chunks and avoid partial aggregation issues
    const stream = await ai.models.generateContentStream({
      model: DEFAULT_MODEL_ID,
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 400, // enough for ~250–300 words
      },
    });

    // Accumulate all text chunks from the stream
    let rawText = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      if (chunk.text) {
        rawText += chunk.text;
        chunkCount++;
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG] Total chunks received:', chunkCount);
    }

    rawText = rawText.trim();

    if (!rawText) {
      console.error(`[ERROR] ${DEFAULT_MODEL_ID} devolvió texto vacío o inválido (stream).`);
      throw new AppError(
        500,
        'Error al comunicarse con el asistente. Por favor, intentá de nuevo.'
      );
    }

    // Simple debug: length only
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] Modelo usado: ${DEFAULT_MODEL_ID}`);
      console.log(`[DEBUG] Longitud respuesta (stream):`, rawText.length);
    }

    // Append the disclaimer only if it's not already present
    let finalText = rawText;

    if (!finalText.includes('⚠️')) {
      finalText = `${finalText}\n\n${DISCLAIMER}`;
    }

    return finalText;
  } catch (error: any) {
    console.error(`Error calling ${DEFAULT_MODEL_ID} API:`, error);
    console.error('Error details:', {
      status: error?.status,
      statusText: error?.statusText,
      message: error?.message,
      model: DEFAULT_MODEL_ID,
    });
    
    // Mejorar mensaje de error según el tipo
    let errorMessage = 'Error al comunicarse con el asistente. Por favor, intentá de nuevo.';
    
    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('limit') || error?.message?.includes('QUOTA_EXCEEDED') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = `Se alcanzó el límite de uso del modelo ${DEFAULT_MODEL_ID}. Por favor, intentá más tarde o considerá cambiar a otro modelo en AI_MODEL.`;
    } else if (error?.message?.includes('API_KEY') || error?.message?.includes('API key') || error?.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'La API key no es válida. Verificá la configuración en el archivo .env.';
    } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      errorMessage = `El modelo '${DEFAULT_MODEL_ID}' no está disponible. Verificá la configuración del modelo en AI_MODEL.`;
    }
    
    throw new AppError(500, errorMessage);
  }
}
