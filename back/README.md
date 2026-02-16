# 🎮 Multiplayer Word Game Backend

Backend service for a real-time multiplayer word guessing game.

## 🧱 Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- TypeScript
- REST API

---

## 📁 Project Structure

- `models/`  
  Mongoose schemas representing MongoDB collections.

- `routes/`  
  Express route definitions (REST endpoints).

- `controllers/`  
  Handle HTTP requests and responses.

- `services/`  
  Core business logic (game flow, scoring, turn management).

- `middlewares/`  
  Authentication, authorization, and error handling.

- `utils/`  
  Shared helpers like word generation and scoring rules.

- `docs/`  
  Technical documentation (API and database).

---
## Detailed Structure 
game-backend/
│
├── README.md
├── package.json
├── .env.example
├── .gitignore
│
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # HTTP server bootstrap
│   │
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   └── env.ts             # Environment variables
│   │
│   ├── models/                # Mongoose schemas
│   │   ├── Game.model.ts
│   │   ├── User.model.ts
│   │   ├── Team.model.ts
│   │   ├── TeamPlayer.model.ts
│   │   ├── Round.model.ts
│   │   ├── Turn.model.ts
│   │   └── Guess.model.ts
│   │
│   ├── routes/                # Route definitions
│   │   ├── game.routes.ts
│   │   ├── player.routes.ts
│   │   ├── team.routes.ts
│   │   ├── round.routes.ts
│   │   └── guess.routes.ts
│   │
│   ├── controllers/           # HTTP request handlers
│   │   ├── game.controller.ts
│   │   ├── player.controller.ts
│   │   ├── team.controller.ts
│   │   ├── round.controller.ts
│   │   └── guess.controller.ts
│   │
│   ├── services/              # Business logic
│   │   ├── game.service.ts
│   │   ├── team.service.ts
│   │   ├── round.service.ts
│   │   ├── turn.service.ts
│   │   └── scoring.service.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── wordGenerator.ts
│   │   ├── scoreCalculator.ts
│   │   └── time.utils.ts
│   │
│   └── types/
│       └── index.d.ts
│
└── docs/
    ├── api.md                 # API documentation
    └── database.md            # DB schema reference

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
# Tallaa
