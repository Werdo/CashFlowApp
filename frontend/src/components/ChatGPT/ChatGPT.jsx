import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, X, Minimize2, Maximize2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config/api';
import './ChatGPT.css';

const ChatGPT = ({ onClose, initialContext }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/chatgpt/ask`,
        {
          message: userMessage,
          context: initialContext,
          conversationHistory: messages.slice(1) // Exclude initial greeting
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add assistant response
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.data.message
        }
      ]);

    } catch (error) {
      console.error('ChatGPT Error:', error);

      let errorMessage = 'Lo siento, hubo un error al procesar tu solicitud.';

      if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, vuelve a iniciar sesión.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Demasiadas solicitudes. Por favor, intenta más tarde.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: errorMessage,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`chatgpt-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chatgpt-header">
        <div className="chatgpt-header-left">
          <Bot size={20} className="chatgpt-icon" />
          <span className="chatgpt-title">Asistente Financiero</span>
        </div>
        <div className="chatgpt-header-right">
          <button
            className="chatgpt-header-btn"
            onClick={() => navigate('/ai-settings')}
            aria-label="Settings"
            title="Configuración de IA"
          >
            <Settings size={18} />
          </button>
          <button
            className="chatgpt-header-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            className="chatgpt-header-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="chatgpt-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatgpt-message ${msg.role} ${msg.isError ? 'error' : ''}`}
              >
                <div className="chatgpt-message-avatar">
                  {msg.role === 'assistant' ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="chatgpt-message-content">
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatgpt-message assistant loading">
                <div className="chatgpt-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="chatgpt-message-content">
                  <Loader size={16} className="chatgpt-loader" />
                  <span>Pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatgpt-input-container">
            <textarea
              ref={inputRef}
              className="chatgpt-input"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chatgpt-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatGPT;
