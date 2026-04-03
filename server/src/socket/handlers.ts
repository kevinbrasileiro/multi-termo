import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./socketEvents.js";
import { roomsManager } from "../game/rooms.js";
import { evaluateGuess } from "../game/wordle.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_room", () => {
      const roomId = roomsManager.createRoom(socket.id)
      socket.emit("room_created", roomId)
    })

    socket.on("join_room", (roomId) => {
      const room = roomsManager.getRoom(roomId)
      if (!room || room.players.length >= 2) return
      roomsManager.joinRoom(socket.id, roomId)
      
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      socket.join(roomId)
    })

    socket.on("submit_guess", (guess) => {
      const roomId = [...socket.rooms].find(r => r !== socket.id)
      if (!roomId) return

      const playerGuesses = roomsManager.submitGuess(socket.id, roomId, guess)
      const opponentId = roomsManager.getOpponentId(socket.id, roomId) ?? ""

      socket.emit("guess_result", playerGuesses)
      io.to(opponentId).emit("opponent_guess", playerGuesses.length)
    })
  })
}