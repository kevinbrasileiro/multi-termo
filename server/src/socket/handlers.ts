import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./socketEvents.js";
import { gamesManager } from "../game/games.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_game", (callback) => {
      const gameId = gamesManager.createGame(socket.id, {maxGuesses: 6, maxPlayers: 2, private: true})

      callback(gameId)
      emitGameState(gameId)
    })

    socket.on("join_game", (gameId, callback) => {
      const gameExists = gamesManager.joinGame(socket.id, gameId)

      if (!gameExists) {
        return callback({status: "error", errorMessage: "game does not exist or is full"})
      }
      
      [...socket.rooms].forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      socket.join(gameId)

      callback({status: "ok"})
      emitGameState(gameId)
    })

    socket.on("submit_guess", (guess, callback) => {
      const gameId = [...socket.rooms].find(r => r !== socket.id)
      if (!gameId) return

      const result = gamesManager.submitGuess(socket.id, gameId, guess)
      callback(result)

      if (result.status === "ok") {
        emitGameState(gameId)
      }
    })

    const emitGameState = (gameId: string) => {
      const game = gamesManager.getGame(gameId)
      if (!game) return

      Object.keys(game.players).forEach((playerId) => {
        const state = gamesManager.getFormattedGameState(playerId, gameId)
        if (!state) return

        io.to(playerId).emit("update_game_state", state)
      })
    }
  })
}