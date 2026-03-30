import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socketEvents.js";
import { roomsManager } from "../game/rooms.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_room", () => {
      const roomId = roomsManager.createRoom(socket.id)
      socket.join(roomId)
      socket.emit("room_created", roomId)
    })

    socket.on("join_room", (roomId) => {
      const room = roomsManager.joinRoom(socket.id, roomId)
      if (!room || room.players.length <= 0) return
      socket.join(roomId)
    })

    socket.on("submit_guess", (guess) => {
      // const roomId = [...socket.rooms].find(r => r !== socket.id)
      socket.emit("broadcast", `${guess} guess received`)
      console.log(socket.id, guess)
    })
  })
}