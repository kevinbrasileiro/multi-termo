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

    console.log(`${gameId} created`)
    console.dir(this.games)
    return gameId
  }

  joinGame(playerId: string, gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false

    if (game.players[playerId]) return true
    
    if (Object.keys(game.players).length >= game.config.maxPlayers) return false
    
    game.players[playerId] = {guesses: [], score: 0}

    console.log(`${playerId} joined ${game.id}`)
    console.dir(this.games)
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

    if (guess.length !== 5) {
      return { status: "error", errorMessage: "Invalid length", guesses: player.guesses }
    }

    if (player.guesses.length >= game.config.maxGuesses) {
      return { status: "error", errorMessage: "Guess limit reached", guesses: player.guesses}
    }

    if (!guessExists(guess)) {
      return { status: "error", errorMessage: "Word cannot be accepted", guesses: player.guesses}
    }

    const result = evaluateGuess(guess, game.word)
    player.guesses.push(result)
    
    console.log(`${playerId}@${game.id} guessed ${guess}`)
    console.dir(this.games)

    return {
      status: "ok",
      guesses: player.guesses
    }
  }
}

export const gamesManager = new GamesManager()