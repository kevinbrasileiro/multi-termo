import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./socketEvents.js";
import { roomsManager } from "../game/rooms.js";
import { evaluateGuess } from "../game/wordle.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_room", (callback) => {
      const roomId = roomsManager.createRoom(socket.id)
      callback(roomId)
    })

    socket.on("join_room", (roomId, callback) => {
      const roomExists = roomsManager.joinRoom(socket.id, roomId)

      if (!roomExists) {
        return callback({status: "error", errorMessage: "room does not exist"})
      }
      
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      socket.join(roomId)
      callback({status: "ok"})
    })

    socket.on("submit_guess", (guess, callback) => {
      const roomId = [...socket.rooms].find(r => r !== socket.id)
      if (!roomId) return

      const playerGuesses = roomsManager.submitGuess(socket.id, roomId, guess)

      callback(playerGuesses)
      socket.to(roomId).emit("opponent_guess", playerGuesses.length)
    })
  })
}