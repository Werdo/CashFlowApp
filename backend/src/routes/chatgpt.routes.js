const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to verify authentication
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/chatgpt/ask
 * Send a question to ChatGPT and get a response
 * @protected
 */
router.post('/ask', authMiddleware, async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify OpenAI API key is configured
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in .env file'
      });
    }

    // Build messages array for ChatGPT
    const messages = [
      {
        role: 'system',
        content: `Eres un asistente financiero experto especializado en análisis de flujo de caja (cashflow).
Tu rol es ayudar a los usuarios a:
- Analizar sus ingresos y gastos
- Identificar patrones de gasto
- Sugerir optimizaciones financieras
- Responder preguntas sobre sus datos financieros
- Proporcionar consejos prácticos sobre gestión de efectivo

Siempre responde en español de manera clara, concisa y profesional.
${context ? `\n\nContexto actual del usuario:\n${JSON.stringify(context, null, 2)}` : ''}`
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const assistantMessage = response.data.choices[0].message.content;

    res.json({
      success: true,
      message: assistantMessage,
      usage: response.data.usage,
      model: response.data.model,
    });

  } catch (error) {
    console.error('ChatGPT API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(500).json({
        error: 'Invalid OpenAI API key',
        message: 'Please verify your OPENAI_API_KEY in .env file'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Failed to communicate with ChatGPT',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * POST /api/chatgpt/analyze
 * Analyze financial data with ChatGPT
 * @protected
 */
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { data, analysisType } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required for analysis' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured'
      });
    }

    // Build analysis prompt based on type
    let prompt = '';
    switch (analysisType) {
      case 'cashflow':
        prompt = `Analiza el siguiente flujo de caja y proporciona insights clave:
${JSON.stringify(data, null, 2)}

Proporciona:
1. Resumen de la situación financiera
2. Patrones identificados
3. Áreas de mejora
4. Recomendaciones específicas`;
        break;

      case 'expenses':
        prompt = `Analiza los siguientes gastos y proporciona recomendaciones:
${JSON.stringify(data, null, 2)}

Identifica:
1. Categorías con mayor gasto
2. Gastos innecesarios o reducibles
3. Tendencias preocupantes
4. Sugerencias de optimización`;
        break;

      case 'forecast':
        prompt = `Basándote en estos datos históricos, proporciona una proyección:
${JSON.stringify(data, null, 2)}

Incluye:
1. Proyección de ingresos/gastos para próximos 3 meses
2. Análisis de tendencias
3. Factores de riesgo
4. Recomendaciones preventivas`;
        break;

      default:
        prompt = `Analiza los siguientes datos financieros:
${JSON.stringify(data, null, 2)}

Proporciona insights útiles y recomendaciones.`;
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Eres un analista financiero experto especializado en análisis de flujo de caja.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    res.json({
      success: true,
      analysis: response.data.choices[0].message.content,
      usage: response.data.usage,
    });

  } catch (error) {
    console.error('ChatGPT Analysis Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to analyze data',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;
