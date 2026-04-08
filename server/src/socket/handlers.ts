import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./socketEvents.js";
import { gamesManager } from "../game/games.js";

export const registerSocketHandlers = (io: Server<ClientToServerEvents, ServerToClientEvents>) => {
  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on("ping", () => console.log("PING received"))

    socket.on("create_game", (callback) => {
      const gameId = gamesManager.createGame(socket.id, {maxGuesses: 6, maxPlayers: 2, private: true})
      callback(gameId)
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
    })

    socket.on("submit_guess", (guess, callback) => {
      const gameId = [...socket.rooms].find(r => r !== socket.id)
      if (!gameId) return

      const result = gamesManager.submitGuess(socket.id, gameId, guess)
      callback(result)

      const formattedGuessesToOpponents = result.guesses.map((guess) => 
        guess.map(char => ({
          letter: "",
          result: char.result
        }))
      )
      
      if (result.status === "ok") {
        socket.to(gameId).emit("opponent_guess", formattedGuessesToOpponents)
      }
    })
  })
}