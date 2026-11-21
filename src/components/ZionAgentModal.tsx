import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  Calendar,
  ShoppingBag,
  MessageCircle,
  RotateCcw,
  Loader2,
  User,
  AlertCircle,
} from 'lucide-react';
import { Service, CompanyConfig } from '../types';
import { buildWhatsAppUrl } from '../utils/scheduling';
import { queryZionAssistant } from '../utils/zionClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}

interface ZionAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  config: CompanyConfig;
  onOpenSchedule: (service?: Service) => void;
  onAddToCart: (service: Service) => void;
}

const QUICK_PROMPTS = [
  'Qual lavagem você indica pro meu carro?',
  'Como funciona o Leva e Traz?',
  'Me explique algo ou tire uma dúvida geral',
  'Me dê uma dica rápida ou receita do dia',
];

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const renderedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={partIdx}>{part}</React.Fragment>;
    });

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <p key={lineIdx} className="leading-relaxed">
        {renderedLine}
      </p>
    );
  });
}

export const ZionAgentModal: React.FC<ZionAgentModalProps> = ({
  isOpen,
  onClose,
  services,
  config,
  onOpenSchedule,
  onAddToCart,
}) => {
  const initialGreeting: ChatMessage = {
    id: 'zion-welcome',
    role: 'assistant',
    text: `Olá! Eu sou o **Zion**, a Inteligência Artificial do **${config.name}**.\n\nVocê pode me perguntar **qualquer coisa** — dúvidas sobre o lava jato (lavagens, vitrificação, Leva e Traz, valores, horários) ou sobre **qualquer outro assunto** do dia a dia, estudos, receitas, cálculos, curiosidades e tecnologia. Como posso te ajudar agora?`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const promoService = services.find((s) => s.id === 'lavagem-especial') || services[0];
  const whatsappUrl = buildWhatsAppUrl(
    config.whatsappDigits,
    'Olá! Conversei com o agente Zion no site do Maruípe Lava Jato e gostaria de agendar um atendimento.'
  );

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const apiMessages = nextMessages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, text: m.text }));

      const { reply } = await queryZionAssistant({
        messages: apiMessages,
        services,
        config,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `zion-${Date.now()}`,
          role: 'assistant',
          text: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `Ops! Falha de conexão ao falar com o Zion. Se preferir atendimento imediato, clique no botão do WhatsApp abaixo (${config.whatsappPhone}).`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([initialGreeting]);
    setInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-5 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Agente IA Zion"
    >
      <div className="w-full sm:max-w-md h-[88vh] sm:h-[640px] sm:max-h-[88vh] bg-neutral-950 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20">
              <Bot className="w-6 h-6" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-black text-white tracking-tight">
                  ZION · Agente IA
                </h2>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-amber-400 font-medium">
                IA Universal · Lava Jato e Qualquer Assunto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="Reiniciar conversa"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar Agente IA Zion"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-950">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mb-0.5">
                    {msg.isError ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-sm space-y-1.5 ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-neutral-950 font-medium rounded-br-sm shadow'
                      : msg.isError
                      ? 'bg-red-950/40 border border-red-500/30 text-red-200 rounded-bl-sm'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm'
                  }`}
                >
                  {isUser ? <p className="leading-relaxed">{msg.text}</p> : renderFormattedText(msg.text)}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0 mb-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Zion está digitando...</span>
              </div>
            </div>
          )}

          {/* Quick Suggested Questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-1">
                Perguntas rápidas para o Zion:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-amber-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Helpful Action Shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-900/80 border-t border-neutral-800/90 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSchedule();
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] hover:brightness-110 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar Horário</span>
          </button>

          {promoService && (
            <button
              type="button"
              onClick={() => onAddToCart(promoService)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-semibold text-[11px] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Lavagem R$ 50</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] hover:bg-emerald-600/30 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte qualquer coisa ao Zion (lava jato ou qualquer assunto)..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white placeholder:text-neutral-500 text-xs sm:text-sm outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensagem para o Zion"
            className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
