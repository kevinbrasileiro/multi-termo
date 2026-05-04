import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./socketEvents.js";
import { gamesManager } from "../game/GamesManager.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.data.playerId = socket.handshake.auth.playerId
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_game", (config, callback) => {
      const gameId = gamesManager.createGame(config)

      callback(gameId)
      emitGameState(gameId)
    })

    socket.on("join_game", (gameId, username, password, callback) => {
      const game = gamesManager.getGame(gameId)
      if (!game) return callback("not_found")

      const result = game.join(socket.data.playerId, username, password)

      if (result !== "ok") {
        return callback(result)
      }
      
      [...socket.rooms].forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      socket.join(gameId)
      socket.data.gameId = gameId

      callback("ok")
      emitGameState(gameId)
    })

    socket.on("get_random_game", (callback) => {
      const publicGame = gamesManager.getRandomPublicGame()
      
      callback(publicGame?.id || "")
    })

    const handleLeaveGame = () => {
      const gameId = socket.data.gameId
      if (!gameId) return

      gamesManager.leaveGame(socket.data.playerId, gameId)
      emitGameState(gameId)
    }

    socket.on("disconnect", handleLeaveGame)
    socket.on("leave_game", handleLeaveGame)

    socket.on("submit_guess", (guess, callback) => {
      const game = gamesManager.getGame(socket.data.gameId)
      if (!game) return callback({status: "not_found"})

      const result = game.submitGuess(socket.data.playerId, guess)
      callback(result)

      if (result.status === "ok") {
        emitGameState(game.id)
      }
    })

    socket.on("vote_rematch", () => {
      const game = gamesManager.getGame(socket.data.gameId)
      if (!game) return

      game.voteRematch(socket.data.playerId)
      emitGameState(game.id)
    })

    const emitGameState = (gameId: string) => {
      const game = gamesManager.getGame(gameId)
      if (!game) return

      const publicState = game.getPublicGameState()

      io.to(gameId).emit("update_game_state", publicState)
    }
  })
}