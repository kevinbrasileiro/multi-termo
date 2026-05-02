import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import { registerSocketHandlers } from "./socket/handlers.js"
import { gamesManager } from "./game/GamesManager.js"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const httpServer = createServer(app)

const INACTIVITY_TIMEOUT = 1000 * 60 * 10 // 10min

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL
  }
})
registerSocketHandlers(io)

setInterval(() => {
  gamesManager.cleanupInactiveGames(INACTIVITY_TIMEOUT)
}, INACTIVITY_TIMEOUT)


const PORT = Number(process.env.PORT) || 3000
httpServer.listen(PORT, "0.0.0.0", () => console.log("server running on port 3000"))