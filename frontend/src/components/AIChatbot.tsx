import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  csvData?: any[];
  modelType?: 'kepler' | 'tess';
}

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, csvData, modelType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; limit: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Initialize with welcome message
      if (messages.length === 0) {
        const welcomeMessage: Message = {
          role: 'assistant',
          content: `Hello! 👋 I'm your AI assistant for exoplanet analysis. I have access to ${csvData?.length || 0} ${modelType?.toUpperCase() || ''} exoplanet predictions. Feel free to ask me questions about:\n\n• Specific exoplanet properties\n• Statistical analysis of the results\n• Comparison between different exoplanets\n• Habitability assessments\n• Detection methods and confidence levels\n\nWhat would you like to know?`,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, csvData, modelType]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare context about the CSV data
      const dataContext = csvData ? `
You are analyzing ${csvData.length} exoplanet predictions from the ${modelType?.toUpperCase()} dataset. 
Here's a summary of the data:
- Total predictions: ${csvData.length}
- Model type: ${modelType}
- Sample data structure: ${JSON.stringify(csvData.slice(0, 2), null, 2)}

Available fields in the dataset: ${Object.keys(csvData[0] || {}).join(', ')}
` : 'No data available.';

      // Prepare messages for API
      const messagesToSend = [
        {
          role: 'system',
          content: `You are an expert exoplanet scientist and data analyst. You help users understand and analyze exoplanet detection data from NASA missions. 
              
${dataContext}

Provide accurate, scientific, and helpful responses. Use emojis occasionally to make the conversation engaging. Format numbers clearly and provide insights where relevant.`
        },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: 'user',
          content: inputMessage.trim(),
        }
      ];

      // Call our secure API endpoint instead of OpenAI directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle rate limit error
        if (response.status === 429) {
          throw new Error(errorData.message || 'Rate limit exceeded. Please try again tomorrow.');
        }
        
        throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update rate limit info
      if (data.rateLimit) {
        setRateLimitInfo(data.rateLimit);
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ ${error instanceof Error ? error.message : 'Unknown error occurred. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Chat cleared! 🧹 I'm still here to help you analyze ${csvData?.length || 0} exoplanet predictions. What would you like to know?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col pointer-events-auto border-2 border-purple-400/50 dark:border-purple-600/50 animate-[slideInRight_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <i className="fas fa-robot text-3xl text-white"></i>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    AI Exoplanet Assistant
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">GPT-3.5</span>
                  </h2>
                  <p className="text-sm text-purple-100">
                    {csvData?.length || 0} predictions • {modelType?.toUpperCase() || 'Unknown'} dataset
                  </p>
                  {rateLimitInfo && (
                    <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                      <i className="fas fa-clock"></i>
                      {rateLimitInfo.remaining} / {rateLimitInfo.limit} messages remaining today
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-semibold"
                  title="Clear chat"
                >
                  <i className="fas fa-trash-alt"></i>
                  Clear
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
                  title="Close"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-400/30 scrollbar-track-transparent">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-[slideInRight_0.3s_ease-out]`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white dark:bg-gray-800 border border-purple-200/50 dark:border-purple-700/50 text-gray-800 dark:text-gray-200'
                  } shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <i className="fas fa-robot text-purple-500 dark:text-purple-400 text-xl mt-1"></i>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <i className="fas fa-user text-white text-xl mt-1"></i>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-[slideInRight_0.3s_ease-out]">
                <div className="bg-white dark:bg-gray-800 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-robot text-purple-500 dark:text-purple-400 text-xl"></i>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-purple-200/50 dark:border-purple-700/50 bg-white/50 dark:bg-gray-800/50 rounded-b-2xl">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the exoplanet predictions..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              <i className="fas fa-info-circle mr-1"></i>
              Powered by OpenAI GPT-4 • Your questions help improve the analysis
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
