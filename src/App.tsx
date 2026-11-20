import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight, ArrowUp, Check, Eye, EyeOff, Hash, Info, LoaderCircle,
  LockKeyhole, LogOut, MessageCircle, Radio, RefreshCw, ShieldCheck,
  UsersRound, Wifi, WifiOff,
} from './icons';
import { login, logout, register, restoreSession } from './auth';
import type { ChatUser } from './auth';
import { MAX_TEXT_LENGTH, useChat } from './useChat';

type AuthMode = 'login' | 'register';
type Notice = { type: 'error' | 'info'; message: string } | null;

function AuthForm({ onAuthenticated, notice }: {
  onAuthenticated: (user: ChatUser) => void;
  notice: Notice;
}) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  function changeMode(next: AuthMode) {
    setMode(next);
    setError('');
    setPassword('');
    setConfirm('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = username.trim();
    if (!name || !password) return;
    if (mode === 'register' && password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }
    setError('');
    setWorking(true);
    try {
      const user = mode === 'register'
        ? await register(name, password)
        : await login(name, password);
      setPassword('');
      setConfirm('');
      onAuthenticated(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось выполнить запрос.');
    } finally {
      setWorking(false);
    }
  }

  return <main className="auth-layout">
    <section className="auth-visual" aria-label="О приложении">
      <div className="brand"><div className="brand-icon"><MessageCircle size={24} /></div><span>group<span className="brand-bold">chat</span><span className="brand-mark">.</span></span></div>
      <div className="visual-content">
        <span className="eyebrow"><span className="eyebrow-dot"/> ОНЛАЙН ОБЩЕНИЕ</span>
        <h1>Общение<br/><span>без границ.</span></h1>
        <p>Один общий чат. Сообщения в реальном времени. Доступ только с аккаунтом.</p>
        <div className="preview-chat" aria-hidden="true">
          <div className="preview-top"><span className="preview-channel"><Hash size={16}/> общий-чат</span><span><span className="tiny-dot"/> Live</span></div>
          <div className="sample-row"><span className="sample-avatar lilac">A</span><div><strong>alex</strong><p>Всем привет! 👋</p></div><small>12:40</small></div>
          <div className="sample-row"><span className="sample-avatar cyan">M</span><div><strong>maria</strong><p>Привет! Как дела?</p></div><small>12:41</small></div>
          <div className="sample-row"><span className="sample-avatar coral">D</span><div><strong>dan</strong><p>Отлично, рад вас видеть!</p></div><small>12:42</small></div>
        </div>
        <div className="visual-foot"><ShieldCheck size={17}/> Защищённый доступ с JWT <span className="foot-sep"/> <Radio size={16}/> WebSocket</div>
      </div>
      <div className="auth-visual-glow"/>
    </section>
    <section className="auth-side">
      <div className="mobile-brand brand"><div className="brand-icon"><MessageCircle size={21}/></div><span>group<span className="brand-bold">chat</span><span className="brand-mark">.</span></span></div>
      <div className="auth-box">
        <span className="form-label-top">ДОБРО ПОЖАЛОВАТЬ</span>
        <h2>{mode === 'login' ? 'С возвращением!' : 'Создай аккаунт'}</h2>
        <p className="auth-description">{mode === 'login' ? 'Войди, чтобы присоединиться к общему чату.' : 'Зарегистрируйся и присоединяйся к беседе.'}</p>
        <div className="auth-switch" role="tablist" aria-label="Выбрать действие">
          <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Вход</button>
          <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Регистрация</button>
        </div>
        {notice && <div className={`notice ${notice.type}`} role="status"><Info size={16}/>{notice.message}</div>}
        {error && <div className="notice error" role="alert"><Info size={16}/>{error}</div>}
        <form onSubmit={submit} className="auth-form">
          <label htmlFor="username">Имя пользователя</label>
          <div className="input-wrap"><UsersRound size={18}/><input id="username" type="text" value={username} onChange={event => setUsername(event.target.value)} placeholder="Введите никнейм" autoComplete="username" required minLength={2} maxLength={150}/></div>
          <label htmlFor="password">Пароль</label>
          <div className="input-wrap"><LockKeyhole size={18}/><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Введите пароль" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={4}/><button type="button" className="reveal" onClick={() => setShowPassword(show => !show)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          {mode === 'register' && <><label htmlFor="confirm">Повтори пароль</label><div className="input-wrap"><LockKeyhole size={18}/><input id="confirm" type={showPassword ? 'text' : 'password'} value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Повтори пароль" autoComplete="new-password" required minLength={4}/></div></>}
          <button className="primary-btn" type="submit" disabled={working}>
            {working ? <><LoaderCircle size={18} className="spin"/> Подключаемся…</> : <>{mode === 'login' ? 'Войти в чат' : 'Создать аккаунт'} <ArrowRight size={19}/></>}
          </button>
        </form>
        <div className="auth-note"><ShieldCheck size={16}/> Access-токен не сохраняется в localStorage.</div>
      </div>
      <div className="right-footer">GROUPCHAT · React + TypeScript + JWT</div>
    </section>
  </main>;
}

function MessageTime({ timestamp }: { timestamp: number }) {
  const time = new Date(timestamp);
  return <time dateTime={time.toISOString()} title={time.toLocaleString('ru-RU')}>
    {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
  </time>;
}

function ChatRoom({ user, onLogout, onSessionExpired }: {
  user: ChatUser;
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const { status, messages, error, serverUsername, reconnect, send } = useChat(true, onSessionExpired);
  const [draft, setDraft] = useState('');
  const streamRef = useRef<HTMLDivElement>(null);
  const displayName = serverUsername || user.username;
  const online = status === 'online';

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [messages]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (send(draft)) setDraft('');
  }

  return <main className="chat-layout">
    <aside className="chat-sidebar">
      <div className="brand"><div className="brand-icon"><MessageCircle size={24}/></div><span>group<span className="brand-bold">chat</span><span className="brand-mark">.</span></span></div>
      <div className="sidebar-section-label">ПРОСТРАНСТВО</div>
      <div className="channel active"><Hash size={19}/><span>общий-чат</span><span className="channel-count">01</span></div>
      <div className="sidebar-intro"><div className="sidebar-intro-icon"><UsersRound size={23}/></div><h3>Место для общения</h3><p>Все авторизованные участники могут писать здесь в реальном времени.</p></div>
      <div className="sidebar-bottom"><div className="sidebar-user"><div className="user-avatar">{displayName.charAt(0).toUpperCase() || 'U'}</div><div><strong title={displayName}>{displayName}</strong><span><span className="active-dot"/> В аккаунте</span></div><button type="button" onClick={onLogout} title="Выйти из аккаунта" aria-label="Выйти из аккаунта"><LogOut size={19}/></button></div></div>
    </aside>
    <section className="chat-main" aria-label="Общий чат">
      <header className="chat-header"><div className="chat-header-title"><div className="header-hash"><Hash size={23}/></div><div><h1>общий-чат</h1><p>Общение в реальном времени</p></div></div><div className={`connection-state ${status}`} role="status" aria-live="polite">{online ? <Wifi size={16}/> : status === 'offline' ? <WifiOff size={16}/> : <LoaderCircle size={16} className="spin"/>}<span>{online ? 'Подключено' : status === 'authenticating' ? 'Проверка JWT' : status === 'connecting' ? 'Подключение…' : 'Нет соединения'}</span></div></header>
      <div ref={streamRef} className="messages" role="log" aria-label="Сообщения общего чата" aria-live="polite" aria-relevant="additions">
        <div className="chat-welcome"><div className="welcome-icon"><Hash size={30}/></div><h2>Добро пожаловать в общий чат!</h2><p>Здесь появляются сообщения, полученные через WebSocket после подключения. Старую историю сервер не передаёт.</p><span><ShieldCheck size={15}/> Только для авторизованных пользователей</span></div>
        {messages.map(message => {
          const own = message.sender === displayName;
          return <article key={message.id} className={`message-row ${own ? 'own' : ''}`}><div className={`message-avatar ${own ? 'me' : ''}`}>{message.sender.charAt(0).toUpperCase() || '?'}</div><div className="message-content"><div className="message-meta"><strong>{message.sender}</strong>{own && <span className="you-label">вы</span>}<MessageTime timestamp={message.timestamp}/></div><p>{message.text}</p></div></article>;
        })}
      </div>
      <div className="bottom-area">
        {error && <div className="chat-warning" role="alert"><Info size={17}/><span>{error}</span><button type="button" onClick={reconnect}><RefreshCw size={15}/> Повторить</button></div>}
        <form className="composer" onSubmit={submitMessage}><label className="sr-only" htmlFor="message">Текст сообщения</label><input id="message" value={draft} maxLength={MAX_TEXT_LENGTH} autoComplete="off" onChange={event => setDraft(event.target.value)} disabled={!online} placeholder={online ? 'Напиши сообщение...' : 'Отправка станет доступна после AUTH_SUCCESS'}/><span className="character-count">{draft.length}/{MAX_TEXT_LENGTH}</span><button type="submit" disabled={!online || !draft.trim()} aria-label="Отправить сообщение"><ArrowUp size={21}/></button></form>
        <div className="composer-note"><span><Check size={14}/> JWT + WebSocket</span><span>Сообщения видны после получения NEW_MESSAGE</span></div>
      </div>
    </section>
  </main>;
}

export default function App() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const expireSession = useCallback(() => {
    setUser(null);
    setNotice({ type: 'error', message: 'Не удалось обновить JWT. Войди снова.' });
  }, []);

  useEffect(() => {
    let mounted = true;
    void restoreSession().then(restored => { if (mounted) setUser(restored); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function authenticated(next: ChatUser) {
    setNotice(null);
    setUser(next);
  }

  function handleLogout() {
    const request = logout();
    setUser(null);
    setNotice({ type: 'info', message: 'Ты вышел из аккаунта.' });
    void request.catch(() => {
      setNotice({ type: 'info', message: 'На этом устройстве выполнен выход. Сервер не подтвердил завершение сессии — проверь подключение.' });
    });
  }

  if (loading) return <div className="boot"><div className="brand-icon"><MessageCircle size={27}/></div><LoaderCircle className="spin" size={22}/><p>Проверяем сессию…</p></div>;
  return user
    ? <ChatRoom user={user} onLogout={handleLogout} onSessionExpired={expireSession}/>
    : <AuthForm onAuthenticated={authenticated} notice={notice}/>;
}
