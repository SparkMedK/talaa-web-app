# 🎮 Tallaa - Frontend Documentation

## 📌 Overview

**Tallaa** is a real-time multiplayer word guessing game. This frontend application interacts with a RESTful backend to manage game state, user interactions, and real-time gameplay updates.

The application is built to handle:
- **Lobby Management**: Creating games, joining teams, and waiting for players.
- **Game Flow**: Round-based gameplay with describing players and guessing teams.
- **Real-time Synchronization**: Polling-based state updates.

---

## 🔌 API Communication

### Protocol
- **REST API**: All interactions are performed via standard HTTP requests.
- **Base URL**: `http://localhost:3000` (Default, configurable via env).

### Authentication
The backend functionality is stateless but requires user identification for game actions.
- **Mechanism**: `x-user-id` Header.
- **Usage**:
  - Upon joining or creating a game, the backend returns a `userId`.
  - This `userId` **MUST** be stored (e.g., `localStorage` or `SessionStorage`).
  - **Every** subsequent state-modifying request (e.g., join team, start round, guess) **MUST** include the header:
    ```http
    x-user-id: <YOUR_USER_ID>
    ```

### 🔄 Polling Strategy (Game State Synchronization)
Since the backend does not use WebSockets, the frontend must poll for updates.
- **Endpoint**: `GET /games/:gameId`
- **Frequency**: Every **1–2 seconds**.
- **Scope**: This endpoint returns the **complete** game tree (Game, Users, Teams, Rounds, Turns). The frontend should diff this state or replace the local store to reflect changes.

---

## 🕹 Game Flow (UI Perspective)

### 1. Welcome / Landing
- **User Action**: Create a new game OR Join an existing game via ID.
- **API**: `POST /games` (Create) or `POST /games/:gameId/join` (Join).

### 2. Lobby (`status: "LOBBY"`)
- **Display**: List of users and teams.
- **Actions**:
  - **Admin**: Create teams (`POST /games/:gameId/teams`), Move players (`POST /teams/:teamId/assign`), Start Game (`POST /games/:gameId/start`).
  - **Player**: Wait for assignment.
- **Polling**: Active.

### 3. Gameplay (`status: "PLAYING"`)
The game cycles through **Rounds**.

#### Round Start
- **Admin**: Must manually trigger `POST /games/:gameId/rounds` to create a new round (if not auto-created).
- **Status**: Game enters a round.

#### Turn Cycle
- **Status**: Check `currentRound` and active `Turn`.
- **Describer**: One player is assigned as `describer`. They see the `words` to describe.
- **Guessers**: Teammates guess the words.
- **Input**: Send guesses via `POST /turns/:turnId/guess`.
- **Timer**: Frontend should visualize the `duration` countdown, but rely on backend status for actual turn end.

### 4. Game End (`status: "FINISHED"`)
- **Display**: Final Scoreboard.
- **Action**: Admin can `POST /games/:gameId/restart`.

---

## 📂 Key Entities (Read-Only on Frontend)
The frontend treats the following as truth from the backend:
- **Scores**: Calculated by backend (`teams.score`, `guesses.points`).
- **Time**: `turns.startTime` and `turns.duration` determine the remaining time.
- **Roles**: `users.role` ("ADMIN" | "PLAYER") dictates UI permissions.
