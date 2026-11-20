# GROUPCHAT — отдельный групповой чат (React + TypeScript)

Это **новый самостоятельный проект только для группового чата**. Никаких страниц ECLIPSE, музыкального сайта и редактирования профиля.

## Возможности

- Регистрация и вход по никнейму и паролю через внешний API.
- JWT access-токен хранится **только в памяти** браузера.
- Refresh-токен, по протоколу учебного API, хранится в **HttpOnly cookie** сервера. Браузер отправляет cookie с `credentials: 'include'`.
- При обновлении страницы приложение пробует восстановить доступ с помощью `POST /token/refresh/`.
- Сразу после открытия WebSocket первым сообщением отправляется `{"type":"AUTH","payload":{"token":"..."}}`.
- Пока не пришёл `AUTH_SUCCESS`, ввод/отправка сообщений заблокированы.
- Сообщения отправляются в формате `CHAT_MESSAGE` и отображаются по `NEW_MESSAGE`.
- При разрыве соединения — ограниченные попытки переподключения; перед повторной WebSocket-авторизацией при необходимости используется refresh.
- Logout: закрывается WebSocket, стирается access и вызывается `POST /logout/`.
- Отдельный адаптивный интерфейс без других разделов.

## Серверные адреса

- HTTP API: `https://inai-col3.fishrungames.com/api`
- Документация API: https://inai-col3.fishrungames.com/api/docs/
- WebSocket: `wss://inai-col3.fishrungames.com/chat/`

Ожидаются эндпоинты `POST /register/`, `POST /login/`, `POST /token/refresh/`, `POST /logout/`. Логин и регистрация должны возвращать `{"access":"..."}`, а сервер должен устанавливать refresh cookie. Это следует из предоставленного образца `Musik-grupp-JWT` и протокола задания. При другой схеме backend нужно изменить `src/auth.ts`.

## Запуск (Windows, PowerShell)

```powershell
npm.cmd install
npm.cmd run dev
```

Открой адрес, который выведет Vite (обычно http://localhost:5173/group-chat-jwt/).

Проверка перед GitHub:

```powershell
npm.cmd run build
```

## Как опубликовать на GitHub Pages

1. Создай **новый пустой публичный репозиторий** `group-chat-jwt` (не загружай код поверх ECLIPSE).
2. Открой папку `group-chat-jwt` в VS Code и выполни:

```powershell
git init
git add .
git commit -m "Create JWT WebSocket group chat"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/group-chat-jwt.git
git push -u origin main
```

3. Открой в репозитории `Settings -> Pages -> Source -> GitHub Actions`.
4. Файл `.github/workflows/deploy.yml` автоматически установит зависимости (`npm install`), соберёт Vite и опубликует `dist/`.
5. Адрес: `https://ТВОЙ_ЛОГИН.github.io/group-chat-jwt/` после успешного Actions.
6. Чтобы GitHub правильно отобразил автора коммитов, проверь:

```powershell
git config user.name
git config user.email
git log -1 --format="%an <%ae>"
```

Имя/email установи **своими значениями** до коммита, если настройки чужие. Email можно использовать GitHub `noreply`, если он привязан к аккаунту. Не используй чужую учётную запись.

Если название репозитория другое, исправь `base: '/group-chat-jwt/'` в `vite.config.ts`.

## Важно про безопасность и ограничения

- Проверка JWT и запрет отправки неавторизованным пользователям **обязательно должны выполняться на сервере**. Клиент лишь следует протоколу (подтверждение `AUTH_SUCCESS`).
- JWT нельзя записывать в URL, логи или `localStorage`.
- На GitHub Pages приложение работает по HTTPS, а чат — через WSS.
- Сохранение refresh-cookie зависит от серверных CORS, `SameSite`, `Secure` и политики браузера в отношении сторонних cookies. Сайт на github.io не может исправить эти настройки на сервере.
- Протокол задания **не содержит получения истории сообщений**: показываются только события, полученные после подключения.
- Сборка подтверждает TypeScript и Vite, но не проверяет реальную доступность и конфигурацию внешнего API/WebSocket. Проверяй регистрацию, отправку и logout на опубликованном сайте с двумя собственными тестовыми аккаунтами.
