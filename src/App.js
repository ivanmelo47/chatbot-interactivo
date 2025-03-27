import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPaperPlane, FaRobot, FaSpinner, FaTrash } from 'react-icons/fa';
import './App.css';

function App() {
  // Estados
  const [conversation, setConversation] = useState([
    { text: '¡Hola! Soy tu asistente con memoria de conversación. ¿En qué puedo ayudarte hoy?', isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // URL de la API Magic Loops con historial de mensajes
  const API_URL = 'https://magicloops.dev/api/loop/b9cf6f62-fcf8-4cd6-abdf-24335a411905/run';

  // Desplazamiento automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Formatear historial para la API
  const formatHistory = () => {
    return conversation.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    }));
  };

  // Función para enviar mensaje a la API con historial
  const sendToMagicLoops = async (message) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(API_URL, {
        mensaje: message,
        historial: formatHistory()
      });

      return response.data?.respuesta || "No recibí una respuesta válida";
    } catch (err) {
      console.error('Error al conectar con Magic Loops:', err);
      setError('Ocurrió un error al conectar con el servidor. Por favor intenta nuevamente.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    // Agregar mensaje del usuario
    const userMessage = { text: trimmedMessage, isUser: true };
    setConversation(prev => [...prev, userMessage]);
    setInputMessage('');

    // Obtener respuesta de Magic Loops con historial
    const botResponse = await sendToMagicLoops(trimmedMessage);
    
    if (botResponse) {
      setConversation(prev => [...prev, { 
        text: botResponse, 
        isUser: false 
      }]);
    }
  };

  // Limpiar conversación
  const clearConversation = () => {
    setConversation([
      { text: 'Conversación reiniciada. ¿En qué puedo ayudarte ahora?', isUser: false }
    ]);
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="chatbot-wrapper">
        <div className="chatbot-card card shadow-lg">
          {/* Cabecera */}
          <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 className="mb-0 d-flex align-items-center">
              <FaRobot className="me-2" />
              Chatbot de Josue Ivan
            </h5>
            <div>
              <button 
                onClick={clearConversation} 
                className="btn btn-sm btn-outline-light me-2"
                title="Limpiar conversación"
              >
                <FaTrash />
              </button>
              {isLoading ? (
                <span className="badge bg-warning text-dark">
                  <FaSpinner className="spin-animation me-1" />
                  Pensando...
                </span>
              ) : (
                <span className="badge bg-success">Conectado</span>
              )}
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="card-body messages-area">
            {conversation.map((msg, index) => (
              <div 
                key={index} 
                className={`message-container ${msg.isUser ? 'user-message' : 'bot-message'}`}
              >
                <div className={`message-bubble ${msg.isUser ? 'user' : 'bot'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {error && (
              <div className="alert alert-danger mt-2 p-2">
                <small>{error}</small>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Entrada de texto */}
          <div className="card-footer">
            <form onSubmit={handleSendMessage} className="message-form">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  aria-label="Mensaje"
                  disabled={isLoading}
                />
                <button 
                  className="btn btn-primary d-flex align-items-center justify-content-center" 
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  style={{ minWidth: '45px' }}
                >
                  {isLoading ? (
                    <FaSpinner className="spin-animation" />
                  ) : (
                    <FaPaperPlane className="send-icon" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;