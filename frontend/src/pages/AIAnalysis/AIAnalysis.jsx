import React, { useState, useEffect } from 'react';
import { Brain, Send, Sparkles, TrendingUp, Target, AlertCircle, Loader } from 'lucide-react';
import './AIAnalysis.css';

const AIAnalysis = () => {
  const [aiConfig, setAiConfig] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const config = localStorage.getItem('ai-config');
    if (config) {
      const parsed = JSON.parse(config);
      setAiConfig(parsed.enabled ? parsed : null);
    }
  }, []);

  const quickAnalysis = [
    {
      icon: TrendingUp,
      title: 'Análisis de Patrones',
      description: 'Identifica tendencias en tus gastos e ingresos',
      query: 'Analiza los patrones de gastos de los últimos 3 meses e identifica categorías donde gasto más'
    },
    {
      icon: Target,
      title: 'Predicción de Ahorro',
      description: 'Proyecta tu capacidad de ahorro',
      query: '¿Podré ahorrar €500 en los próximos 3 meses basándome en mi cashflow actual?'
    },
    {
      icon: Sparkles,
      title: 'Escenario "¿Qué pasaría si...?"',
      description: 'Simula cambios en tu presupuesto',
      query: '¿Qué pasaría si reduzco mis gastos en entretenimiento un 20%?'
    },
    {
      icon: AlertCircle,
      title: 'Recomendaciones',
      description: 'Obtén consejos personalizados',
      query: 'Dame 5 recomendaciones para mejorar mi salud financiera basándote en mis datos'
    }
  ];

  const handleQuickAnalysis = (analysisQuery) => {
    setQuery(analysisQuery);
  };

  const handleSendQuery = async () => {
    if (!query.trim() || !aiConfig) return;

    const userMessage = { role: 'user', content: query };
    setMessages([...messages, userMessage]);
    setIsLoading(true);
    setQuery('');

    // TODO: Replace with actual AI API call
    setTimeout(() => {
      const aiResponse = generateMockResponse(query);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsLoading(false);
    }, 2000);
  };

  const generateMockResponse = (userQuery) => {
    const lowerQuery = userQuery.toLowerCase();

    if (lowerQuery.includes('patrón') || lowerQuery.includes('categor')) {
      return `**Análisis de Patrones de Gastos (Últimos 3 Meses)**

📊 **Categorías Principales:**

1. **Alimentación**: €450/mes (35% del total)
   - Tendencia: ↑ +12% vs mes anterior
   - Picos: Fines de semana (+40%)

2. **Transporte**: €280/mes (22% del total)
   - Tendencia: → Estable
   - Nota: Gastos consistentes en gasolina

3. **Entretenimiento**: €180/mes (14% del total)
   - Tendencia: ↑ +25% vs mes anterior
   - Oportunidad de ahorro identificada

4. **Servicios**: €150/mes (12% del total)
   - Tendencia: → Estable
   - Suscripciones recurrentes

**Recomendación:** Considera reducir gastos en entretenimiento y optimizar compras de alimentación planificando menús semanales.`;
    }

    if (lowerQuery.includes('ahorro') || lowerQuery.includes('ahorrar')) {
      return `**Predicción de Ahorro: €500 en 3 Meses**

✅ **Pronóstico: ALCANZABLE**

📈 **Análisis Actual:**
- Ingresos promedio mensual: €2,100
- Gastos promedio mensual: €1,250
- Margen disponible: €850/mes

🎯 **Proyección:**
- Ahorro necesario mensual: €167
- Margen actual disponible: €850/mes
- **Probabilidad de éxito: 95%**

💡 **Plan Sugerido:**
1. Mantén gastos fijos actuales
2. Reduce gastos variables un 10% (€80/mes extra)
3. Configura transferencia automática de €170/mes
4. Reserva €680/mes para imprevistos

**Resultado esperado:** €510 ahorrados en 3 meses con margen de seguridad.`;
    }

    if (lowerQuery.includes('qué pasaría') || lowerQuery.includes('reduzco')) {
      return `**Escenario: Reducción 20% en Entretenimiento**

🔮 **Simulación de Impacto:**

**Situación Actual:**
- Gasto mensual en entretenimiento: €180
- % del presupuesto total: 14%

**Después de Reducción (-20%):**
- Nuevo gasto en entretenimiento: €144
- Ahorro mensual generado: €36
- Ahorro anual proyectado: €432

📊 **Efectos en tu Cashflow:**
- Balance mensual: €850 → €886 (+4.2%)
- Capacidad de ahorro anual: +€432
- Impacto en calidad de vida: MÍNIMO

💰 **Usos Recomendados del Ahorro Extra:**
1. Fondo de emergencia (€216/año)
2. Inversión/Ahorro (€150/año)
3. Pago adelantado deudas (€66/año)

**Conclusión:** Esta reducción es sostenible y genera impacto significativo sin sacrificar calidad de vida.`;
    }

    if (lowerQuery.includes('recomendaci') || lowerQuery.includes('consejo')) {
      return `**5 Recomendaciones Personalizadas para Mejorar tu Salud Financiera**

1. **📱 Optimiza Suscripciones**
   - Detecté €45/mes en servicios duplicados
   - Elimina o downgrade suscripciones poco usadas
   - Ahorro potencial: €270/año

2. **🍽️ Planifica Compras de Alimentación**
   - Tus gastos en alimentación varían ±30% mensualmente
   - Implementa menús semanales y lista de compras
   - Reducción estimada: 15% (€68/mes)

3. **💳 Consolida Pagos Pequeños**
   - 23 transacciones <€10 en el último mes
   - Agrupa compras pequeñas semanalmente
   - Evita cargos bancarios innecesarios

4. **🎯 Establece Meta de Ahorro Automático**
   - Configura transferencia automática de €200/mes
   - Tu cashflow actual lo permite cómodamente
   - Lograrás €2,400 de ahorro en 12 meses

5. **📊 Revisa Gastos Variables Mensualmente**
   - Tus gastos variables fluctúan ±22%
   - Dedica 15min/mes a revisar categorías principales
   - Identifica y corrige desviaciones temprano

**Impacto Total:** Implementando estas 5 acciones podrías ahorrar aproximadamente €650/mes adicionales.`;
    }

    return `He analizado tu consulta sobre: "${userQuery}"

Basándome en tus datos de cashflow, aquí está mi análisis:

**Resumen:**
Con tu patrón actual de ingresos (€2,100/mes promedio) y gastos (€1,250/mes promedio), mantienes un balance saludable de €850/mes.

**Puntos Clave:**
- Tu tasa de ahorro actual es del 40% (excelente)
- Gastos principales: Alimentación (35%), Transporte (22%), Entretenimiento (14%)
- Tendencia: Gastos estables con ligero incremento en entretenimiento

**Próximos Pasos:**
Para obtener análisis más específicos, prueba con preguntas como:
- "¿Cuánto gasto mensualmente en [categoría]?"
- "¿Puedo permitirme [gasto específico]?"
- "Proyecta mi ahorro para los próximos 6 meses"

¿Hay algo más específico que te gustaría saber?`;
  };

  const getProviderName = () => {
    if (!aiConfig) return '';
    const providers = {
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      custom: 'IA Privada'
    };
    return providers[aiConfig.provider] || aiConfig.provider;
  };

  if (!aiConfig) {
    return (
      <div className="ai-analysis-page">
        <div className="ai-analysis-header">
          <div className="ai-header-left">
            <div className="ai-icon-wrapper">
              <Brain size={32} />
            </div>
            <div>
              <h1 className="ai-title">Análisis con IA</h1>
              <p className="ai-subtitle">Obtén insights inteligentes sobre tu cashflow</p>
            </div>
          </div>
        </div>

        <div className="ai-not-configured">
          <Brain size={64} />
          <h2>IA No Configurada</h2>
          <p>Para usar esta función, primero debes configurar tu proveedor de IA en Ajustes.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '#/settings'}>
            Ir a Ajustes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-page">
      <div className="ai-analysis-header">
        <div className="ai-header-left">
          <div className="ai-icon-wrapper">
            <Brain size={32} />
          </div>
          <div>
            <h1 className="ai-title">Análisis con IA</h1>
            <p className="ai-subtitle">Conectado a {getProviderName()}</p>
          </div>
        </div>
      </div>

      <div className="ai-content">
        {/* Quick Analysis Cards */}
        {messages.length === 0 && (
          <div className="quick-analysis-section">
            <h2 className="section-title">Análisis Rápidos</h2>
            <p className="section-description">Selecciona un análisis predefinido o escribe tu propia consulta</p>

            <div className="quick-analysis-grid">
              {quickAnalysis.map((analysis, index) => (
                <div
                  key={index}
                  className="quick-analysis-card"
                  onClick={() => handleQuickAnalysis(analysis.query)}
                >
                  <div className="card-icon">
                    <analysis.icon size={24} />
                  </div>
                  <h3 className="card-title">{analysis.title}</h3>
                  <p className="card-description">{analysis.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.role}`}>
                <div className="message-icon">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={i}>{line.slice(2, -2)}</strong>;
                    }
                    if (line.startsWith('###')) {
                      return <h4 key={i}>{line.slice(4)}</h4>;
                    }
                    if (line.trim().match(/^[0-9]+\./)) {
                      return <li key={i} style={{ marginLeft: '1.5rem' }}>{line.slice(line.indexOf('.') + 1)}</li>;
                    }
                    return <p key={i}>{line || <br />}</p>;
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message message-assistant">
                <div className="message-icon">🤖</div>
                <div className="message-content loading">
                  <Loader className="spinner" size={20} />
                  <span>Analizando tu cashflow...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="ai-input-container">
          <input
            type="text"
            className="ai-input"
            placeholder="Escribe tu pregunta sobre tu cashflow..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
          />
          <button
            className="btn btn-primary send-button"
            onClick={handleSendQuery}
            disabled={!query.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Example Queries */}
        {messages.length === 0 && (
          <div className="example-queries">
            <p className="example-label">Ejemplos de preguntas:</p>
            <div className="example-chips">
              <span className="example-chip" onClick={() => setQuery('¿Cuánto gasto en comida al mes?')}>
                ¿Cuánto gasto en comida al mes?
              </span>
              <span className="example-chip" onClick={() => setQuery('¿Podré ahorrar €500 en 3 meses?')}>
                ¿Podré ahorrar €500 en 3 meses?
              </span>
              <span className="example-chip" onClick={() => setQuery('¿Qué gastos puedo reducir?')}>
                ¿Qué gastos puedo reducir?
              </span>
              <span className="example-chip" onClick={() => setQuery('Proyecta mi ahorro para 6 meses')}>
                Proyecta mi ahorro para 6 meses
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
