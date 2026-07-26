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
    <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      {/* Mesh Background Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-800/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="min-h-[80px] w-full flex flex-col lg:flex-row items-center justify-between px-4 lg:px-8 py-3 lg:py-0 border-b border-white/10 bg-white/5 backdrop-blur-xl z-10 shrink-0 gap-4 lg:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-xl text-white">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">AI MED TUTOR</h1>
            <p className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">KMU IHS Swabi</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900/50 p-1 rounded-full border border-white/10 overflow-x-auto max-w-full hide-scrollbar">
          <button
            onClick={() => setMode('general')}
            className={`flex items-center whitespace-nowrap gap-2 px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-200 ease-in-out ${
              mode === 'general'
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            General Assistant
          </button>
          <button
            onClick={() => setMode('echo')}
            className={`flex items-center whitespace-nowrap gap-2 px-4 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-200 ease-in-out ${
              mode === 'echo'
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Echo Specific
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Network Status</p>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs font-mono text-slate-300">Gemini-1.5-Pro</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center">
            <span className="text-xs font-bold text-white">MD</span>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        {/* Sidebar */}
        <aside className="w-72 bg-black/20 border-r border-white/5 backdrop-blur-lg flex-col p-6 hidden lg:flex">
          <div className="mb-8">
            <button 
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-semibold transition-colors"
            >
              + New Study Session
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center opacity-50">
            <Stethoscope className="w-16 h-16 text-slate-700 mb-4" />
            <p className="text-xs text-slate-500 text-center px-4">
              Your study session history will appear here.
            </p>
          </div>
        </aside>

        {/* Chat Section */}
        <section className="flex-1 flex flex-col relative">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 w-full mx-auto flex flex-col gap-6">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 px-4">
                <div className={`p-4 rounded-full mb-4 ${mode === 'echo' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-blue-600/10 text-blue-400 border border-blue-500/30'}`}>
                  {mode === 'echo' ? <Activity className="w-12 h-12" /> : <Stethoscope className="w-12 h-12" />}
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">
                  Welcome to {mode === 'echo' ? 'Echocardiography Tutor' : 'General Medical Tutor'}
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  {mode === 'echo'
                    ? "I specialize in echocardiography interpretation, standard views (PLAX, PSAX, Apical), and cardiovascular case studies."
                    : "I am here to assist you with broad clinical, physiological, anatomical, and medical education guidance."}
                </p>
                <p className="text-sm mt-6 text-slate-500 max-w-md">
                  <Info className="inline w-4 h-4 mr-1 mb-1" />
                  Note: Do not rely solely on this AI for actual clinical decision-making. Always consult standard medical literature.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {msg.role === 'model' ? (
                    <div className="w-8 h-8 rounded-lg bg-cyan-600 flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-[10px] font-bold text-white">AI</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-[10px] font-bold text-slate-300">STUD</span>
                    </div>
                  )}
                  <div
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-2xl rounded-tr-none text-right'
                        : 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-200 prose-headings:font-semibold prose-a:text-cyan-400 prose-strong:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-100 font-medium">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-4 max-w-3xl">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex-shrink-0 flex items-center justify-center mt-1">
                  <span className="text-[10px] font-bold text-white">AI</span>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span className="text-sm font-medium text-slate-400">Analyzing...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="flex justify-center my-4">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-center gap-2 backdrop-blur-md">
                  <Info className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Input Area */}
          <footer className="shrink-0 z-10 w-full">
            <div className="p-4 sm:p-8">
              <form onSubmit={handleSend} className="w-full bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl flex items-end px-4 sm:px-6 py-2 gap-4 transition-shadow focus-within:border-cyan-500/50">
                <textarea
                  className="flex-1 max-h-48 min-h-[48px] py-3 bg-transparent outline-none focus:ring-0 text-slate-200 placeholder:text-slate-500 leading-relaxed text-sm resize-none"
                  placeholder={mode === 'echo' ? "Ask about PLAX, Apical 4-Chamber, or a cardiac case study..." : "Ask a clinical question or request a physiological explanation..."}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = '48px';
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
                <div className="pb-2 flex gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold text-sm text-white disabled:opacity-50 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
                  >
                    <span className="hidden sm:inline">SEND</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <p className="text-xs text-slate-500">
                  AI MED Tutor may produce inaccurate information about people, places, or facts.
                </p>
              </div>
            </div>

            {/* Fixed Footer Status */}
            <div className="h-8 px-4 sm:px-8 bg-slate-900 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex gap-4">
                <span>KMU IHS Swabi - Academic Project</span>
                <span className="text-cyan-600 hidden sm:inline">Secure Session: AES-256</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span>System Live</span>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
