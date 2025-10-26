import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Clock, Wrench, Send, Trash2, Plus, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { chatService, formatTime, renderToolCall, generateSessionTitle, MODELS } from '@/lib/chat';
import type { ChatState, SessionInfo, Message } from '../../worker/types';
export function ChatPage() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: MODELS[0].id,
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [hasUnsavedSession, setHasUnsavedSession] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [chatState.messages, chatState.streamingMessage]);
  useEffect(() => {
    const currentSession = sessions.find(s => s.id === chatState.sessionId);
    setHasUnsavedSession(chatState.messages.length > 0 && !currentSession);
  }, [chatState.messages, chatState.sessionId, sessions]);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({
        ...prev,
        ...response.data,
        sessionId: chatService.getSessionId()
      }));
    }
  }, []);
  const loadSessions = useCallback(async () => {
    const response = await chatService.listSessions();
    if (response.success && response.data) {
      setSessions(response.data);
    }
  }, []);
  const initializeApp = useCallback(async () => {
    await Promise.all([loadCurrentSession(), loadSessions()]);
  }, [loadCurrentSession, loadSessions]);
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);
  const saveCurrentSessionIfNeeded = async () => {
    if (hasUnsavedSession) {
      const firstUserMessage = chatState.messages.find(m => m.role === 'user');
      const title = generateSessionTitle(firstUserMessage?.content);
      await chatService.createSession(title, chatState.sessionId, firstUserMessage?.content);
      toast.success("Session saved", { description: title });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
      streamingMessage: ''
    }));
    if (hasUnsavedSession && chatState.messages.length === 0) {
      const title = generateSessionTitle(message);
      await chatService.createSession(title, chatState.sessionId, message);
      await loadSessions();
    }
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
    setChatState(prev => ({ ...prev, isProcessing: false, streamingMessage: '' }));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  const handleNewSession = async () => {
    await saveCurrentSessionIfNeeded();
    chatService.newSession();
    setChatState({
      messages: [],
      sessionId: chatService.getSessionId(),
      isProcessing: false,
      model: chatState.model,
      streamingMessage: ''
    });
    await loadSessions();
    toast.info("New chat session started.");
  };
  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === chatState.sessionId) return;
    await saveCurrentSessionIfNeeded();
    chatService.switchSession(sessionId);
    setChatState(prev => ({ ...prev, messages: [], streamingMessage: '' }));
    await loadCurrentSession();
    toast.info("Switched session.");
  };
  const handleModelChange = async (model: string) => {
    await chatService.updateModel(model);
    setChatState(prev => ({ ...prev, model }));
    toast.success(`Model updated to ${MODELS.find(m => m.id === model)?.name || model}`);
  };
  const handleClearCurrent = async () => {
    await chatService.clearMessages();
    setChatState(prev => ({ ...prev, messages: [] }));
    toast.success("Current chat cleared.");
  };
  const handleDeleteSession = async (sessionId: string) => {
    await chatService.deleteSession(sessionId);
    if (sessionId === chatState.sessionId) {
      await handleNewSession();
    } else {
      await loadSessions();
    }
    toast.success("Session deleted.");
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 h-[calc(100vh-4rem)] flex flex-col">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2">
            AI <span className="text-gradient">Chatbot</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Converse with your data and unlock new insights.
          </p>
        </motion.div>
        <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-secondary/50">
            <div className="flex items-center gap-2">
              <Select value={chatState.sessionId} onValueChange={handleSwitchSession}>
                <SelectTrigger className="w-[200px] sm:w-[250px] font-semibold">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      <span className="truncate">{session.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={handleNewSession} title="New Chat" className="hover:bg-primary-accent/10 hover:text-primary-accent">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Select value={chatState.model} onValueChange={handleModelChange}>
                <SelectTrigger className="w-[150px] sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><Settings2 className="w-5 h-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleClearCurrent}>Clear Current Chat</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {sessions.map(session => (
                    <DropdownMenuItem key={`del-${session.id}`} onSelect={() => handleDeleteSession(session.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Delete "{session.title}"
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-6" viewportRef={viewportRef}>
              <div className="space-y-6">
                {chatState.messages.length === 0 && !chatState.isProcessing && (
                  <div className="text-center text-muted-foreground py-16 flex flex-col items-center justify-center h-full">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl font-semibold">Start a conversation</h3>
                    <p>Ask me anything about your data.</p>
                  </div>
                )}
                <AnimatePresence>
                  {chatState.messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn("flex items-end gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      {msg.role === 'assistant' && <Bot className="w-8 h-8 text-primary-accent flex-shrink-0" />}
                      <div className={cn("max-w-xl p-4 rounded-2xl", msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.toolCalls && (
                          <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
                            <div className="flex items-center gap-2 text-xs opacity-80"><Wrench className="w-3 h-3" /> Tools Used:</div>
                            {msg.toolCalls.map(tool => <Badge key={tool.id} variant="outline">{renderToolCall(tool)}</Badge>)}
                          </div>
                        )}
                        <div className="text-xs opacity-60 mt-2 text-right flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(msg.timestamp)}
                        </div>
                      </div>
                      {msg.role === 'user' && <User className="w-8 h-8 text-secondary-accent flex-shrink-0" />}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatState.streamingMessage && (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3 justify-start">
                    <Bot className="w-8 h-8 text-primary-accent flex-shrink-0" />
                    <div className="max-w-xl p-4 rounded-2xl bg-secondary rounded-bl-none">
                      <p className="whitespace-pre-wrap break-words">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
                    </div>
                  </motion.div>
                )}
                {chatState.isProcessing && !chatState.streamingMessage && (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3 justify-start">
                    <Bot className="w-8 h-8 text-primary-accent flex-shrink-0" />
                    <div className="max-w-xl p-4 rounded-2xl bg-secondary rounded-bl-none flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Thinking...
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your data..."
                  className="w-full pr-20 min-h-[52px] rounded-full py-3 px-6 resize-none"
                  rows={1}
                  disabled={chatState.isProcessing}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-btn-gradient text-primary-foreground transition-transform duration-200 hover:scale-110 active:scale-95"
                  disabled={!input.trim() || chatState.isProcessing}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}