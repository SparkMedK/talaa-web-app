# 🗄 MongoDB Collections (Schemas)

This document describes all MongoDB collections for the Multiplayer Word Game backend.

---

## 1. games

```ts
games {
  _id: ObjectId
  adminId: ObjectId          // Reference to users._id
  status: "LOBBY" | "PLAYING" | "FINISHED"
  language: "EN"
  maxPlayers: number         // Default: 10
  winningScore: number       // Default: 20
  currentRound: number
  createdAt: Date
  updatedAt: Date
}
users {
  _id: ObjectId
  nickname: string
  role: "ADMIN" | "PLAYER"
  gameId: ObjectId           // Reference to games._id
  isConnected: boolean
  createdAt: Date
}
teams {
  _id: ObjectId
  gameId: ObjectId           // Reference to games._id
  name: string
  score: number
  order: number              // Play order
}
teamPlayers {
  _id: ObjectId
  teamId: ObjectId           // Reference to teams._id
  userId: ObjectId           // Reference to users._id
}
rounds {
  _id: ObjectId
  gameId: ObjectId           // Reference to games._id
  roundNumber: number
  status: "ACTIVE" | "COMPLETED"
}
turns {
  _id: ObjectId
  roundId: ObjectId          // Reference to rounds._id
  teamId: ObjectId           // Reference to teams._id
  describerId: ObjectId      // Reference to users._id
  words: string[]            // Generated words
  solvedWords: string[]
  startTime: Date
  duration: number           // Seconds (default: 30)
  status: "ACTIVE" | "COMPLETED"
}
guesses {
  _id: ObjectId
  turnId: ObjectId           // Reference to turns._id
  userId: ObjectId           // Reference to users._id
  input: string
  points: number
  createdAt: Date
}

🔑 Index 

users → gameId

teams → gameId

rounds → gameId

turns → roundId

guesses → turnId

teamPlayers → teamId, userId