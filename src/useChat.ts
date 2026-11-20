import { useCallback, useEffect, useRef, useState } from 'react';
import { getAccessToken, SessionExpiredError } from './auth';

const WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'wss://inai-col3.fishrungames.com/chat/';
const MAX_MESSAGES = 250;
export const MAX_TEXT_LENGTH = 1000;
const MAX_RECONNECTS = 5;

type ConnectionState = 'connecting' | 'authenticating' | 'online' | 'offline';
export type Message = { id: number; sender: string; text: string; timestamp: number };

interface ServerMessage { type?: unknown; payload?: unknown }
function asServerMessage(raw: string): ServerMessage | null {
  try {
    const data: unknown = JSON.parse(raw);
    return data && typeof data === 'object' && !Array.isArray(data) ? data as ServerMessage : null;
  } catch { return null; }
}

export function useChat(enabled: boolean, onSessionExpired: () => void) {
  const [status, setStatus] = useState<ConnectionState>('connecting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [serverUsername, setServerUsername] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const isAuthed = useRef(false);
  const sequence = useRef(0);
  const callbackRef = useRef(onSessionExpired);
  callbackRef.current = onSessionExpired;

  const reconnect = useCallback(() => setRetry(value => value + 1), []);
  const send = useCallback((text: string): boolean => {
    const value = text.trim();
    const socket = socketRef.current;
    if (!value || value.length > MAX_TEXT_LENGTH || !isAuthed.current ||
        !socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: { text: value } }));
    return true;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let authTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let unauthenticatedCloses = 0;
    isAuthed.current = false;
    setStatus('connecting');
    setError('');
    setMessages([]);
    setServerUsername(null);

    async function connect(refreshFirst = false) {
      if (cancelled) return;
      setStatus('connecting');
      isAuthed.current = false;
      let token: string;
      try {
        token = await getAccessToken(refreshFirst);
      } catch (reason) {
        if (cancelled) return;
        setStatus('offline');
        setError(reason instanceof SessionExpiredError
          ? 'Сессия истекла. Пожалуйста, войдите снова.'
          : 'Не удалось получить access-токен.');
        callbackRef.current();
        return;
      }
      if (cancelled) return;

      let socket: WebSocket;
      try { socket = new WebSocket(WS_URL); }
      catch {
        setStatus('offline');
        setError('Некорректный WebSocket-адрес.');
        return;
      }
      socketRef.current = socket;
      let accepted = false;
      let rejected = false;
      socket.onopen = () => {
        if (cancelled || socketRef.current !== socket) return;
        setStatus('authenticating');
        // Первым сообщением по протоколу всегда отправляется AUTH.
        socket.send(JSON.stringify({ type: 'AUTH', payload: { token } }));
        authTimer = setTimeout(() => {
          if (!accepted && socket.readyState === WebSocket.OPEN) {
            setError('Сервер не подтвердил JWT за 10 секунд.');
            socket.close();
          }
        }, 10_000);
      };
      socket.onmessage = (event: MessageEvent) => {
        if (cancelled || socketRef.current !== socket || typeof event.data !== 'string') return;
        const packet = asServerMessage(event.data);
        if (!packet) return;
        if (packet.type === 'AUTH_SUCCESS') {
          if (authTimer) clearTimeout(authTimer);
          accepted = true;
          isAuthed.current = true;
          attempts = 0;
          unauthenticatedCloses = 0;
          if (packet.payload && typeof packet.payload === 'object' &&
              'username' in packet.payload && typeof packet.payload.username === 'string') {
            setServerUsername(packet.payload.username);
          }
          setError('');
          setStatus('online');
          return;
        }
        if (packet.type === 'NEW_MESSAGE' && accepted && packet.payload &&
            typeof packet.payload === 'object' && !Array.isArray(packet.payload)) {
          const body = packet.payload as Record<string, unknown>;
          if (typeof body.sender !== 'string' || typeof body.text !== 'string' ||
              typeof body.timestamp !== 'number' || !Number.isFinite(body.timestamp)) return;
          const date = new Date(body.timestamp);
          if (Number.isNaN(date.getTime())) return;
          setMessages(previous => [...previous, {
            id: ++sequence.current, sender: body.sender as string,
            text: body.text as string, timestamp: body.timestamp as number,
          }].slice(-MAX_MESSAGES));
          return;
        }
        if (packet.type === 'AUTH_ERROR' || packet.type === 'ERROR') {
          rejected = true;
          setError('Сервер отклонил сообщение или авторизацию.');
          socket.close();
        }
      };
      socket.onerror = () => {
        if (!cancelled) setError('Ошибка соединения с сервером чата.');
      };
      socket.onclose = () => {
        if (authTimer) clearTimeout(authTimer);
        if (cancelled || socketRef.current !== socket) return;
        socketRef.current = null;
        isAuthed.current = false;
        setStatus('offline');
        if (rejected) return;
        if (!accepted) unauthenticatedCloses += 1;
        if (unauthenticatedCloses >= 2) {
          setError('Сервер не принял JWT. Попробуйте войти в аккаунт заново.');
          return;
        }
        if (attempts >= MAX_RECONNECTS) {
          setError('Подключение не восстановлено. Нажмите «Повторить».');
          return;
        }
        attempts += 1;
        setError('Соединение прервано. Переподключаемся…');
        timer = setTimeout(() => void connect(!accepted), Math.min(1000 * 2 ** (attempts - 1), 8000));
      };
    }

    void connect();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (authTimer) clearTimeout(authTimer);
      isAuthed.current = false;
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close(1000, 'Chat closed');
      }
    };
  }, [enabled, retry]);

  return { status, messages, error, serverUsername, reconnect, send };
}
