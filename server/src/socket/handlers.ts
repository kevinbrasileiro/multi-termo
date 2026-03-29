import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socketEvents.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    io.emit("broadcast", socket.id)

    socket.on("ping", () => console.log("PING received"))

    socket.on("create_room", () => {
      const roomId = Math.random().toString(36).substring(2, 8)

      socket.emit("room_created", roomId)
    })
  })
}