
---

## 1. Game APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/games` | Create a new game and admin user |
| GET    | `/games/:gameId` | Get full game state (game, users, teams, rounds, turns) |
| POST   | `/games/:gameId/start` | Start game (**admin only**) |
| POST   | `/games/:gameId/restart` | Restart game and reset scores/rounds (**admin only**) |

---

## 2. Player APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/games/:gameId/join` | Join a game as a player |
| POST   | `/games/:gameId/leave` | Leave a game |
| POST   | `/games/:gameId/kick` | Kick a player from game (**admin only**) |

---

## 3. Team APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/games/:gameId/teams` | Create a team (**admin only**) |
| POST   | `/teams/:teamId/assign` | Assign a player to a team (**admin only**) |
| POST   | `/teams/:teamId/remove` | Remove a player from a team (**admin only**) |

---

## 4. Round & Turn APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/games/:gameId/rounds` | Create a round (**admin only**) |
| POST   | `/rounds/:roundId/turns/start` | Start a turn for a round |
| POST   | `/turns/:turnId/end` | End a turn (auto after duration or manually) |

---

## 5. Guess APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/turns/:turnId/guess` | Submit a guess for an active turn |

---

**Notes:**

- All POST requests with game/round/turn modification require `x-user-id` header.  
- Admin-only endpoints: Start/restart game, create teams, assign/remove players, kick players.  
- Turn duration: 30 seconds, enforced by server.  
- Clients should poll game state via `GET /games/:gameId` every 1–2 seconds.
