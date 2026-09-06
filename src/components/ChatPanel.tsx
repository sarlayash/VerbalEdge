import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Learner } from '../types';
import { Send, Smile, Paperclip, Check, CheckCheck, User, ShieldCheck, Image, FileText, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ChatPanelProps {
  learnerId: string;
  learnerName: string;
  messages: ChatMessage[];
  currentRole: 'learner' | 'admin';
  onSendMessage: (learnerId: string, sender: 'learner' | 'admin', text: string, attachment?: any) => void;
  onMarkRead: (learnerId: string, reader: 'learner' | 'admin') => void;
  compact?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  learnerId,
  learnerName,
  messages,
  currentRole,
  onSendMessage,
  onMarkRead,
  compact = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversation = messages.filter((m) => m.learnerId === learnerId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    onMarkRead(learnerId, currentRole);
  }, [conversation.length, learnerId, currentRole, onMarkRead]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(learnerId, currentRole, inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);

    if (currentRole === 'learner') {
      // Simulate typing indicator from trainer
      setTimeout(() => {
        setIsTypingSimulated(true);
      }, 500);
      setTimeout(() => {
        setIsTypingSimulated(false);
      }, 1550);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage(learnerId, currentRole, `Sent attachment: ${file.name}`, {
        name: file.name,
        type: isImg ? 'image' : 'file',
        url: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const emojis = ['👍', '🔥', '✨', '🎯', '💯', '👏', '🚀', '💡', '🙏', '📝'];

  return (
    <div className={`flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden ${compact ? 'max-h-[520px]' : 'min-h-[500px]'}`}>
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
              {currentRole === 'learner' ? 'KN' : learnerName.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm">
              {currentRole === 'learner' ? 'Kapil Narula (Lead Trainer)' : learnerName}
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Online • Responds rapidly
            </div>
          </div>
        </div>

        <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-mono">
          Private Mentorship
        </span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-60" />
            <p className="text-sm font-medium text-slate-600">No messages yet</p>
            <p className="text-xs max-w-xs mt-1">
              Ask Kapil any verbal aptitude question, request resume bullet feedback, or clarify interview doubt!
            </p>
          </div>
        ) : (
          conversation.map((msg) => {
            const isMe = msg.sender === currentRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Attachment if present */}
                  {msg.fileAttachment && (
                    <div className="mt-2.5 pt-2 border-t border-current/20">
                      {msg.fileAttachment.type === 'image' ? (
                        <img
                          src={msg.fileAttachment.url}
                          alt="Attachment"
                          className="rounded-xl max-h-48 object-cover border border-white/20"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-black/10 p-2 rounded-xl text-xs">
                          <FileText className="w-4 h-4" />
                          <span className="truncate">{msg.fileAttachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck className="w-3 h-3 text-indigo-600" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTypingSimulated && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-2xl w-fit border border-slate-200 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] font-medium ml-1">Kapil is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji selector */}
      {showEmojiPicker && (
        <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1 overflow-x-auto">
          {emojis.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => {
                setInputText((prev) => prev + em);
                sounds.playPop();
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-lg transition"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          title="Upload file or screenshot"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentRole === 'learner'
              ? 'Ask Kapil doubts, questions, or share your pitch...'
              : `Reply to ${learnerName}...`
          }
          className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-md shadow-indigo-500/20 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
