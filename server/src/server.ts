import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"
import { registerSocketHandlers } from "./socket/handlers.js"

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173"
  }
})
registerSocketHandlers(io)

app.get("/", (_, res) => {
  res.send("hello")
})

httpServer.listen(3000, () => console.log("server running on port 3000"))