import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./socketEvents.js";
import { gamesManager } from "../game/games.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_game", (config, callback) => {
      const gameId = gamesManager.createGame(socket.id, config)

      callback(gameId)
      emitGameState(gameId)
    })

    socket.on("join_game", (gameId, callback) => {
      const isGameJoinable = gamesManager.joinGame(socket.id, gameId)

      if (!isGameJoinable) {
        return callback({status: "error", errorMessage: "cannot join game"})
      }
      
      [...socket.rooms].forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      socket.join(gameId)
      socket.data.gameId = gameId

      callback({status: "ok"})
      emitGameState(gameId)
    })

    socket.on("submit_guess", (guess, callback) => {
      const gameId = socket.data.gameId
      if (!gameId) return

      const result = gamesManager.submitGuess(socket.id, gameId, guess)
      callback(result)

      if (result.status === "ok") {
        emitGameState(gameId)
      }
    })

    socket.on("vote_rematch", () => {
      const gameId = socket.data.gameId
      if (!gameId) return

      gamesManager.voteRematch(socket.id, gameId)
      emitGameState(gameId)
    })

    socket.on("disconnect", () => {
      const gameId = socket.data.gameId
      if (!gameId) return

      gamesManager.leaveGame(socket.id, gameId)
      emitGameState(gameId)
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