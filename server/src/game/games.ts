import type { Response } from "../socket/socketEvents.js"
import { evaluateGuess, generateRandomWord, guessExists, type GuessResult } from "./wordle.js"

export type PlayerInfo = {
  username: string
  guesses: GuessResult[]
  score: {round: number, total: number}
  win: number | null // timestamp
  votedRematch: boolean
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

  createGame(playerId: string, username: string, config: Game["config"]): string {
    const gameId = Math.random().toString(36).substring(2, 8)

    this.games.set(gameId, {
      id: gameId,
      players: {
        [playerId]: {username, guesses: [], score: {round: 0, total: 0}, win: null, votedRematch: false} 
      },
      word: "",
      status: "waiting",
      config: {
        maxPlayers: Math.max(1, Math.min(99, config.maxPlayers)),
        maxGuesses: Math.max(3, Math.min(9, config.maxGuesses)),
        mode: config.mode,
        private: config.private,
      }
    })

    if (config.maxPlayers <= 1) {
      this.startGame(gameId)
    }

    return gameId
  }

  joinGame(playerId: string, username: string, gameId: string): boolean {
    const game = this.games.get(gameId)
    if (!game) return false

    const players = game.players
    if (players[playerId]) return true
    
    if (Object.keys(players).length >= game.config.maxPlayers) return false
    if (game.status === "playing") return false
    
    players[playerId] = {username, guesses: [], score: {round: 0, total: 0}, win: null, votedRematch: false}

    if (Object.keys(players).length >= game.config.maxPlayers) {
      this.startGame(gameId)
    }

    return true
  }

  leaveGame(playerId: string, gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    delete game.players[playerId]
    
    if (Object.keys(game.players).length === 1) {
      game.status = "waiting"
    }

    if (Object.keys(game.players).length <= 0) {
      this.games.delete(gameId)
    }
  }

  startGame(gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    Object.entries(game.players).forEach(([_, player]) => {
      player.guesses = []
      player.win = null
      player.votedRematch = false
      player.score.round = 0
    })

    game.status = "playing"
    game.word = generateRandomWord()
  }

  voteRematch(playerId: string, gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    const player = game.players[playerId]
    if (!player) return

    player.votedRematch = true

    const players = Object.entries(game.players)

    const votingPlayers = players.filter(([_, player]) => {
      return player.votedRematch
    })

    if (votingPlayers.length >= players.length) {
      this.startGame(gameId)
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

      if (game.config.maxPlayers === 1) {
        game.status = "finished"
        player.score.total++
      }
    }

    if (normalizedGuess === game.word || player.guesses.length === game.config.maxGuesses) {
      const sortedWinners = this.checkAndSortWinners(game)
      if (sortedWinners) {
        this.scorePlayers(sortedWinners)
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
      return player.win !== null || (player.guesses.length >= game.config.maxGuesses)
    })

    if (finishedPlayers.length < players.length) return

    return finishedPlayers.sort((a, b) => {
      const playerA = a[1]
      const playerB = b[1]

      if (game.config.mode === "guesses" && (playerA.guesses.length !== playerB.guesses.length)) {
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

  private scorePlayers(sortedPlayers: [string, PlayerInfo][]) {
    sortedPlayers.forEach((player, i) => {
      if (player[1].win) {
        player[1].score.round = sortedPlayers.length - 1 - i
        player[1].score.total += sortedPlayers.length - i - 1
      } else {
        player[1].score.round = 0
      }
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
            {...player, guesses: player.guesses.map((guess) =>
              isOwner ? guess : guess.map((guess) => ({
                ...guess,
                letter: "", 
              }))
            )},
          ]
        })
      ),
      status: game.status,
      maxGuesses: game.config.maxGuesses,
      word: game.status === "finished" ? game.word : ""
    }
  }
}

export const gamesManager = new GamesManager()