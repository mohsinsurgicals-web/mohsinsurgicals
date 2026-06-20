import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Phone, Mail } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAllProducts } from '../lib/shopify';
import { Product } from '../types';
import { APP_NAME, CONTACT_PHONE, CONTACT_EMAIL, CATEGORIES } from '../constants';

// Accessing the API key from your .env file
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GEMINI_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hello! I'm the ${APP_NAME} assistant. How can I help you with our medical equipment or store info today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load product data from Shopify to provide as context to the AI
  useEffect(() => {
    fetchAllProducts().then(setProducts).catch(console.error);
  }, []);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Verify API Key existence
    if (!GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'model', content: "API Key not found. Please add VITE_GEMINI_API_KEY to your .env file and restart the server." }]);
      return;
    }

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      const productContext = products.map(p => 
        `- ${p.title}: ₹${p.price} (Category: ${p.category})`
      ).join('\n');

      const systemPrompt = `
        You are the official AI assistant for ${APP_NAME}.
        Store Information:
        - Support: ${CONTACT_PHONE}, ${CONTACT_EMAIL}
        - Available Categories: ${CATEGORIES.map(c => c.name).join(', ')}
        - Product Knowledge Base:
        ${productContext}

        Guidelines:
        1. Only answer questions regarding ${APP_NAME} and medical surgical equipment.
        2. If a user asks for product info, use the pricing and details from the Knowledge Base above.
        3. Be professional, concise, and helpful.
      `;

      // Filter history so the first message sent to the API is always from the 'user'
      const chatHistory = messages
        .filter((_, index) => index !== 0) 
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const runChat = async (modelName: string) => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt
        });
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
      };

      let replyText: string;
      try {
        replyText = await runChat(GEMINI_MODEL);
      } catch (error: any) {
        const notFound = error?.message?.includes('is not found') || error?.message?.includes('[404');
        if (notFound && GEMINI_MODEL !== GEMINI_FALLBACK_MODEL) {
          replyText = await runChat(GEMINI_FALLBACK_MODEL);
        } else {
          throw error;
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: replyText }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      let errorMessage = "I apologize, but I'm having trouble connecting. Please try again in a few minutes or call us at " + CONTACT_PHONE;
      
      // Specific handling for 429 Rate Limit/Quota errors
      if (error.message?.includes("429")) {
        errorMessage = "My daily chat quota is currently full or still activating. Please try again shortly or contact us at " + CONTACT_PHONE;
      }

      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="bg-white w-[350px] sm:w-[400px] h-[500px] shadow-2xl rounded-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Assistant Header */}
          <div className="bg-medical-primary p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={20} /></div>
              <div>
                <p className="font-bold text-sm leading-none">${APP_NAME} Bot</p>
                <p className="text-[10px] opacity-80 mt-1">Free Tier AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' ? 'bg-medical-primary text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100"><Loader2 size={18} className="animate-spin text-medical-primary" /></div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="p-4 bg-white border-t flex gap-2 items-center">
            <input 
              className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-medical-primary/20"
              placeholder="Ask about our medical supplies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()} 
              className="bg-medical-primary text-white p-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-medical-primary text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold text-sm whitespace-nowrap px-0 group-hover:px-2">Chat with us</span>
          <MessageSquare size={26} />
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
