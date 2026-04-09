import type { Response } from "../socket/socketEvents.js"
import { evaluateGuess, generateRandomWord, guessExists, type GuessResult } from "./wordle.js"

export type PlayerInfo = {
  guesses: GuessResult[]
  score: number
  win: number | null // timestamp
}

export type Game = {
  id: string
  players: Record<string, PlayerInfo>
  word: string
  status: "waiting" | "playing" | "finished"
  config: {
    maxPlayers: number
    maxGuesses: number
    mode: "timed" | "guesses"
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
        [playerId]: {guesses: [], score: 0, win: null} 
      },
      word: generateRandomWord(),
      status: "waiting",
      config
    })

    return gameId
  }

  joinGame(playerId: string, gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false

    const players = game.players
    if (players[playerId]) return true
    
    if (Object.keys(players).length >= game.config.maxPlayers) return false
    if (game.status === "playing") return false
    
    players[playerId] = {guesses: [], score: 0, win: null}

    if (Object.keys(players).length >= game.config.maxPlayers) {
      game.status = "playing"
    }

    return true
  }

  leaveGame(playerId: string, gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    delete game.players[playerId]

    if (Object.keys(game.players).length <= 0) {
      this.games.delete(gameId)
    }
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

    if (player.win) {
      return { status: "error", errorMessage: "Player already won", guesses: player.guesses}
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

    const result = evaluateGuess(normalizedGuess, game.word)
    player.guesses.push(result)

    if (normalizedGuess === game.word) {
      player.win = Date.now()

      if (game.config.mode === "timed") {
        game.status = "finished"
        player.score++
      }
    }

    if (normalizedGuess === game.word || player.guesses.length === game.config.maxGuesses) {
      const sortedWinners = this.checkAndSortWinners(game)
      if (sortedWinners) {
        this.scorePLayers(sortedWinners)
        game.status = "finished"
      }
    }

    console.log(`${playerId}@${game.id} guessed ${guess}`)
    console.dir(this.games)

    return {
      status: "ok",
      guesses: player.guesses
    }
  }

  private checkAndSortWinners(game: Game) {
    if (game.status !== "playing") return

    const players = Object.entries(game.players)

    const finishedPlayers = players.filter(([_, player]) => {
      if (player.win !== null || (player.guesses.length >= game.config.maxGuesses)) return player
    })

    if (finishedPlayers.length < players.length) return

    return finishedPlayers.sort((a, b) => {
      const playerA = a[1]
      const playerB = b[1]

      if (playerA.guesses.length !== playerB.guesses.length) {
        return playerA.guesses.length - playerB.guesses.length
      }

      if (playerA.win !== null && playerB.win !== null) {
        return playerA.win - playerB.win
      }

      if (playerA.win !== null) return -1
      if (playerB.win !== null) return 1

      return 0
    })
  }

  private scorePLayers(players: [string, PlayerInfo][]) {
    players.forEach((player, i) => {
      player[1].win 
      ? player[1].score += players.length - i - 1 
      : 0
    })
  }

  getFormattedGameState(playerId: string, gameId: string) {
    const game = this.getGame(gameId)
    if (!game) return

    return {
      players: Object.fromEntries(
        Object.entries(game.players).map(([id, player]) => {
          const isOwner = id === playerId

          return [id,
            {score: player.score, win: player.win, guesses: player.guesses.map((guess) =>
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