import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for serialization
}

const GATEWAY_URL = 'wss://gateway.mimi-bot.com';
const GATEWAY_TOKEN = '3657a115c015e87a1c613d03750cf4bb15d738b93d12035f';
const STORAGE_KEY = 'fittrack_chat_history';
const MAX_STORED_MESSAGES = 50; // 最多保存50条消息

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// 从 localStorage 加载消息
function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const messages = JSON.parse(stored) as Message[];
      // 只保留最近的消息
      return messages.slice(-MAX_STORED_MESSAGES);
    }
  } catch {
    // 忽略解析错误
  }
  return [];
}

// 保存消息到 localStorage
function saveMessages(messages: Message[]) {
  try {
    // 只保存最近的消息
    const toSave = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // 忽略存储错误
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRequests = useRef<Map<string, (data: unknown) => void>>(new Map());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 保存消息到 localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const sendRequest = (method: string, params: Record<string, unknown>): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'));
        return;
      }
      const id = generateId();
      pendingRequests.current.set(id, resolve);
      wsRef.current.send(JSON.stringify({
        type: 'req',
        id,
        method,
        params
      }));
      // Timeout after 30s
      setTimeout(() => {
        if (pendingRequests.current.has(id)) {
          pendingRequests.current.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  };

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionError(null);
    const ws = new WebSocket(GATEWAY_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // Connection opened, waiting for challenge
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle connect challenge
        if (data.type === 'event' && data.event === 'connect.challenge') {
          const connectParams = {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'webchat-ui',
              version: '1.0.0',
              platform: 'web',
              mode: 'webchat'
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write'],
            caps: [],
            commands: [],
            permissions: {},
            auth: { token: GATEWAY_TOKEN },
            locale: 'zh-CN',
            userAgent: 'FitTrack/1.0.0'
          };
          
          try {
            await sendRequest('connect', connectParams);
            setIsConnected(true);
            setConnectionError(null);
          } catch {
            setConnectionError('连接失败');
          }
        }
        
        // Handle responses
        if (data.type === 'res') {
          const resolver = pendingRequests.current.get(data.id);
          if (resolver) {
            pendingRequests.current.delete(data.id);
            if (data.ok) {
              resolver(data.payload);
            } else {
              setConnectionError(data.error?.message || 'Request failed');
            }
          }
        }

        // Handle chat events (streaming response from Gateway)
        if (data.type === 'event' && data.event === 'chat') {
          const payload = data.payload;
          
          // Only handle events for our session
          if (payload?.sessionKey !== 'agent:fitness-coach:main') {
            return;
          }
          
          // Extract text content from message
          const extractContent = (msg: unknown): string | null => {
            if (!msg) return null;
            const m = msg as Record<string, unknown>;
            if (typeof m.content === 'string') return m.content;
            if (Array.isArray(m.content)) {
              const texts = m.content
                .filter((c: unknown) => (c as Record<string, unknown>)?.type === 'text')
                .map((c: unknown) => (c as Record<string, unknown>)?.text)
                .filter((t: unknown) => typeof t === 'string');
              return texts.join('') || null;
            }
            if (typeof m.text === 'string') return m.text;
            return null;
          };
          
          if (payload?.state === 'delta' && payload?.message) {
            const content = extractContent(payload.message);
            if (content) {
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'assistant') {
                  // Update with full content (not delta)
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, content: content }
                  ];
                }
                return [...prev, {
                  id: generateId(),
                  role: 'assistant',
                  content: content,
                  timestamp: new Date().toISOString()
                }];
              });
            }
          }
          
          if (payload?.state === 'final' || payload?.state === 'aborted') {
            setIsLoading(false);
          }
          
          if (payload?.state === 'error') {
            setIsLoading(false);
            setConnectionError(payload?.errorMessage || '处理出错');
          }
        }

      } catch {
        // Failed to parse message
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (event.reason) {
        setConnectionError(event.reason);
      }
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setConnectionError('连接错误');
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !isConnected) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use chat.send method - connect to fitness-coach agent
      await sendRequest('chat.send', {
        sessionKey: 'agent:fitness-coach:main',
        message: userMessage.content,
        idempotencyKey: generateId()
      });
    } catch {
      setIsLoading(false);
      setConnectionError('发送失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Mimi 助手</h1>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm('确定清空聊天记录？')) {
                  setMessages([]);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="清空聊天记录"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isConnected ? '已连接' : '连接中...'}
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {connectionError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>你好！我是 Mimi 🐱</p>
            <p className="text-sm mt-2">告诉我你的体重、饮食、运动，我来帮你记录！</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>试试说：</p>
              <p className="mt-1">"今天体重 75kg"</p>
              <p>"午饭吃了沙拉"</p>
              <p>"跑了 3 公里"</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-primary-100' : 'bg-purple-100'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-600" />
              ) : (
                <Bot className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          disabled={!isConnected}
          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || !isConnected || isLoading}
          className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
