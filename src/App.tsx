import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, Activity, Send, Loader2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import { ChatMode, ChatMessage } from './types';

export default function App() {
  const [mode, setMode] = useState<ChatMode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setError(null);

    const newUserMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: userText,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI MED Tutor.');
      }

      const newModelMsg: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newModelMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">AI MED Tutor</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">KMU Institute of Health Sciences Swabi</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setMode('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out ${
              mode === 'general'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            General Assistant
          </button>
          <button
            onClick={() => setMode('echo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ease-in-out ${
              mode === 'echo'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Echo Specific
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 w-full max-w-5xl mx-auto flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 px-4">
            <div className={`p-4 rounded-full mb-4 ${mode === 'echo' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
              {mode === 'echo' ? <Activity className="w-12 h-12" /> : <Stethoscope className="w-12 h-12" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome to {mode === 'echo' ? 'Echocardiography Tutor' : 'General Medical Tutor'}
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              {mode === 'echo'
                ? "I specialize in echocardiography interpretation, standard views (PLAX, PSAX, Apical), and cardiovascular case studies."
                : "I am here to assist you with broad clinical, physiological, anatomical, and medical education guidance."}
            </p>
            <p className="text-sm mt-6 text-slate-400 max-w-md">
              <Info className="inline w-4 h-4 mr-1 mb-1" />
              Note: Do not rely solely on this AI for actual clinical decision-making. Always consult standard medical literature.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-blue-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 sm:p-6 shrink-0 z-10">
        <div className="max-w-5xl mx-auto relative">
          <form onSubmit={handleSend} className="flex relative items-end shadow-sm border border-slate-300 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
            <textarea
              className="w-full max-h-48 min-h-[56px] resize-none py-4 pl-4 pr-14 bg-transparent outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 leading-relaxed"
              placeholder={mode === 'echo' ? "Ask about PLAX, Apical 4-Chamber, or a cardiac case study..." : "Ask a clinical question or request a physiological explanation..."}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = '56px';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 192)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <div className="absolute right-2 bottom-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-slate-400">
              AI MED Tutor may produce inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
