import type { Response } from "../socket/socketEvents.js"
import { evaluateGuess, generateRandomWord, guessExists, type GuessResult } from "./wordle.js"

export type PlayerInfo = {
  guesses: GuessResult[]
  score: number
}

export type Game = {
  id: string
  players: Record<string, PlayerInfo>
  word: string
  status: "waiting" | "playing" | "finished"
  config: {
    maxPlayers: number
    maxGuesses: number
    private: boolean
  }
}

class GamesManager {
  private games = new Map<string, Game>()

  getGame(gameId: string) {
    return this.games.get(gameId)
  }

  createGame(playerId: string, config: Game["config"]): string {
    const gameId = Math.random().toString(36).substring(2, 8)

    this.games.set(gameId, {
      id: gameId,
      players: {
        [playerId]: {guesses: [], score: 0} 
      },
      word: generateRandomWord(),
      status: "waiting",
      config: config ?? {
        maxGuesses: 6,
        maxPlayers: 2,
        private: true
      }
    })

    return gameId
  }

  joinGame(playerId: string, gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false

    const players = game.players
    if (players[playerId]) return true
    
    if (Object.keys(players).length >= game.config.maxPlayers) return false
    
    players[playerId] = {guesses: [], score: 0}

    if (Object.keys(players).length >= game.config.maxPlayers) {
      game.status = "playing"
    }

    return true
  }

  submitGuess(playerId: string, gameId: string , guess: string): Response & {guesses: GuessResult[]}  {
    const game = this.games.get(gameId)
    if (!game) return {
      status: "error",
      errorMessage: "Not in a game",
      guesses: []
    }

    const player = game.players[playerId]
    if (!player) return {
      status: "error",
      errorMessage: "Player not in this game",
      guesses: []
    }

    if (game.status !== "playing") {
      return { status: "error", errorMessage: "Game is not playing", guesses: player.guesses }
    }

    if (player.guesses.length >= game.config.maxGuesses) {
      return { status: "error", errorMessage: "Guess limit reached", guesses: player.guesses}
    }

    const normalizedGuess = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

    if (normalizedGuess.length !== 5) {
      return { status: "error", errorMessage: "Invalid length", guesses: player.guesses }
    }

    if (!guessExists(normalizedGuess)) {
      return { status: "error", errorMessage: "Word cannot be accepted", guesses: player.guesses}
    }

    if (normalizedGuess === game.word) {
      player.score++
      game.status = "finished"
    }

    const result = evaluateGuess(normalizedGuess, game.word)
    player.guesses.push(result)
    
    console.log(`${playerId}@${game.id} guessed ${guess}`)
    console.dir(this.games)

    return {
      status: "ok",
      guesses: player.guesses
    }
  }

  getFormattedGameState(playerId: string, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    return {
      players: Object.fromEntries(
        Object.entries(game.players).map(([id, player]) => {
          const isOwner = id === playerId

          return [id,
            {score: player.score, guesses: player.guesses.map((guess) =>
              isOwner
              ? guess 
              : guess.map((guess) => ({
                  ...guess,
                  letter: "", 
                }))
            )},
          ]
        })
      ),
      status: game.status
    }
  }
}

export const gamesManager = new GamesManager()