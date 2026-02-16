# 🔗 API Integration Guide

This guide details how the frontend should interact with the backend API.

## 🛠 Configuration

| Key | Value | Notes |
|---|---|---|
| **Base URL** | `http://localhost:3000` | Configurable via `.env` |
| **Content-Type** | `application/json` | Required for POST/PUT |
| **Auth Header** | `x-user-id` | Required for game actions |

---

## 📡 Endpoints & Usage

### 1. Game Management

#### Create Game
Create a new game instance. The creator automatically becomes the **Admin**.

- **Endpoint**: `POST /games`
- **Body**:
  ```json
  {
    "nickname": "PlayerName", // Admin's nickname
    "language": "EN",         // Optional, default "EN"
    "maxPlayers": 10          // Optional
  }
  ```
- **Response**: `{ gameId: string, userId: string, ...gameData }`
- **Action**: Store `userId` in local storage. Redirect to Lobby.

#### Join Game
- **Endpoint**: `POST /games/:gameId/join`
- **Body**:
  ```json
  { "nickname": "PlayerName" }
  ```
- **Response**: `{ userId: string, ...gameData }`
- **Action**: Store `userId`. Redirect to Lobby.

#### Get Game State (Polling)
- **Endpoint**: `GET /games/:gameId`
- **Frequency**: Poll every 1-2s.
- **Response**: Full Game Object (Game, Users, Teams, Rounds, Turns).
- **Handling**: Update local state store completely.

---

### 2. Lobby Actions

#### Create Team (Admin)
- **Endpoint**: `POST /games/:gameId/teams`
- **Headers**: `x-user-id: <ADMIN_ID>`
- **Body**: `{ "name": "Team A" }`

#### Assign Player to Team (Admin)
- **Endpoint**: `POST /teams/:teamId/assign`
- **Headers**: `x-user-id: <ADMIN_ID>`
- **Body**: `{ "userId": "<TARGET_USER_ID>" }`

#### Start Game (Admin)
- **Endpoint**: `POST /games/:gameId/start`
- **Headers**: `x-user-id: <ADMIN_ID>`

---

### 3. Gameplay Loop

#### Start Round (Admin)
- **Endpoint**: `POST /games/:gameId/rounds`
- **Headers**: `x-user-id: <ADMIN_ID>`
- **Trigger**: When needed (usually at start of game or after previous round ends).

#### Start Turn
- **Endpoint**: `POST /rounds/:roundId/turns/start`
- **Headers**: `x-user-id: <DESCRIBER_ID>` (or Admin?) - *Check backend logic, usually the next player or admin triggers it.*

#### Submit Guess
- **Endpoint**: `POST /turns/:turnId/guess`
- **Headers**: `x-user-id: <GUESSER_ID>`
- **Body**: `{ "input": "guessed word" }`
- **Note**: Backend checks if guess matches `words`.

---

## ⚠️ Error Handling

The API uses standard HTTP status codes:
- **200/201**: Success.
- **400**: Bad Request (Validation error, e.g., missing nickname).
- **401**: Unauthorized (Missing/Invalid `x-user-id` for protected actions).
- **403**: Forbidden (Non-admin trying to perform admin action).
- **404**: Not Found (Game or ID not found).
- **500**: Server Error.

**Frontend Strategy**:
- Display toast notifications for `4xx` errors (e.g., "Nickname taken", "Game not found").
- Retry polling silently on `5xx` or network failure.
