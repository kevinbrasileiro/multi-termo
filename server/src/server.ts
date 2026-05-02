import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import { registerSocketHandlers } from "./socket/handlers.js"
import { gamesManager } from "./game/GamesManager.js"

const app = express()
const httpServer = createServer(app)

const INACTIVITY_TIMEOUT = 1000 * 60 * 10 // 10min

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
})
registerSocketHandlers(io)

setInterval(() => {
  gamesManager.cleanupInactiveGames(INACTIVITY_TIMEOUT)
}, INACTIVITY_TIMEOUT)

app.get("/", (_, res) => {
  res.send("hello")
})

httpServer.listen(3000, () => console.log("server running on port 3000"))