import { createHash } from "node:crypto";
import { evaluateGuess, generateRandomWord, guessExists } from "./wordle.js";
import type { GameConfig, GameState, JoinGameResponse, PlayerInfo, SubmitGuessResponse } from "./types.js";

const MAX_ALLOWED_PLAYERS = 99

const MIN_ALLOWED_GUESSES = 3
const MAX_ALLOWED_GUESSES = 9

export class Game {
  id: string
  players: Record<string, PlayerInfo> = {}
  word = ""
  status: "waiting" | "playing" | "finished" = "waiting"
  config: GameConfig
  startedAt: number = 0
  lastActivityAt: number = Date.now()

  constructor(id: string, config: GameConfig) {
    this.id = id
    
    this.config = {
      maxPlayers: Math.max(1, Math.min(MAX_ALLOWED_PLAYERS, config.maxPlayers)),
      maxGuesses: Math.max(MIN_ALLOWED_GUESSES, Math.min(MAX_ALLOWED_GUESSES, config.maxGuesses)),
      mode: config.mode || "guesses",
      private: config.private,
      password: (config.password && config.maxPlayers >= 2 && config.private)
      ? createHash("sha256").update(config.password).digest("hex") 
      : null
    }

    if (this.config.maxPlayers <= 1) {
      this.start()
    }
  }

  private touch() {
    this.lastActivityAt = Date.now()
  }

  private createPlayer(username: string): PlayerInfo {
    return {
      username: username || `Anonymous${Math.floor(Math.random() * 1000) + 1}`,
      guesses: [],
      score: {round: 0, total: 0},
      win: null,
      votedRematch: false
    }
  }

  join(playerId: string, username: string, password: string | null): JoinGameResponse {
    const existingPlayer = this.players[playerId]
    
    if (existingPlayer && !existingPlayer.connected) {
      existingPlayer.connected = true
      return "ok"
    }
    if (existingPlayer) return "already_joined"

    if (this.players[playerId]) return "already_joined"
    if (Object.keys(this.players).length >= this.config.maxPlayers) return "full"
    if (this.status === "playing") return "already_started"

    if (this.config.password) {
      if (!password) return "requires_password"

      const hashed = createHash("sha256").update(password).digest("hex")
      if (hashed !== this.config.password) return "invalid_password"
    }

    this.players[playerId] = this.createPlayer(username)

    if (Object.keys(this.players).length >= this.config.maxPlayers) {
      this.start()
    } 

    return "ok"
  }

  leave(playerId: string) {
    delete this.players[playerId]

    if (Object.keys(this.players).length === 1) this.status = "waiting"
  }

  start() {
    this.touch()
    this.startedAt = Date.now()

    Object.values(this.players).forEach((player => {
      player.guesses = []
      player.win = null
      player.votedRematch = false
      player.score.round = 0
    }))

    this.word = generateRandomWord()
    this.status = "playing"
  }

  voteRematch(playerId: string) {
    this.touch()
    
    const player = this.players[playerId]
    if (!player) return

    player.votedRematch = true

    const allVoted = Object.values(this.players).every(player => player.votedRematch)

    if (allVoted) this.start()
  }

  submitGuess(playerId: string, guess: string): SubmitGuessResponse {
    this.touch()
    
    const player = this.players[playerId]
    if (!player) return {status: "not_on_game"}

    if (this.status !== "playing") return {status: "game_not_playing"}
    if (player.win) return {status: "player_already_won"}
    if (player.guesses.length >= this.config.maxGuesses) return {status: "guess_limit_reached"}

    const normalizedGuess = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    
    if (normalizedGuess.length !== 5) return {status: "incorrect_length"}
    if (!guessExists(normalizedGuess)) return {status: "not_on_wordlist"}

    const result = evaluateGuess(normalizedGuess, this.word)
    player.guesses.push(result)

    if (normalizedGuess === this.word) {
      player.win = Date.now()

      if (this.config.maxPlayers === 1) {
        this.status = "finished"
        player.score.round++
        player.score.total++
      }
    }

    if (normalizedGuess === this.word || player.guesses.length === this.config.maxGuesses) {
      const sortedWinners = this.checkAndSortWinners()
      if (sortedWinners) {
        this.scorePlayers(sortedWinners)
        this.status = "finished"
      }
    }

    return {status: "ok", guesses: player.guesses}
  }

  private checkAndSortWinners() {
    if (this.status !== "playing") return
    
    const players = Object.entries(this.players)

    const finishedPlayers = players.filter(([, player]) => {
      return player.win !== null || player.guesses.length >= this.config.maxGuesses
    })

    if (finishedPlayers.length < players.length) return

    if (this.config.mode === "guesses") {
      return finishedPlayers.sort((a, b) => {
        return a[1].guesses.length - b[1].guesses.length
      })
    }

    if (this.config.mode === "timed") {
      return finishedPlayers.sort((a, b) => {
        return (a[1].win ?? Infinity) - (b[1].win ?? Infinity)
      })
    }
  }

  private scorePlayers(sortedPlayers: [string, PlayerInfo][]) {
    let scoreToGive = sortedPlayers.length - 1
    let previousGuessAmount = 0

    if (this.config.mode === "timed") {
      sortedPlayers.forEach(([_, player]) => {
        if (!player.win) {
          player.score.round = 0
          return
        }

        player.score.round += scoreToGive
        player.score.total += scoreToGive
        scoreToGive--
      })
      return
    }

    sortedPlayers.forEach(([_, player]) => {
      if (!player.win) {
        player.score.round = 0
        return
      } 

      if (previousGuessAmount == 0) {
        previousGuessAmount = player.guesses.length
      } 
      
      if (player.guesses.length !== previousGuessAmount) {
        scoreToGive -= 1
        previousGuessAmount = player.guesses.length
      }

      player.score.round += scoreToGive
      player.score.total += scoreToGive
    })
  }

  getPublicGameState(): GameState {
    return {
      players: Object.fromEntries(
        Object.entries(this.players).map(([id, player]) => {
          return [id,
            {...player, guesses: player.guesses.map((guess) =>
              guess.map((guess) => ({
                ...guess,
                letter: this.status === "playing" ? "" : guess.letter, 
              }))
            )},
          ]
        })
      ),
      status: this.status,
      word: this.status === "finished" ? this.word : "",
      config: {...this.config, password: ""},
      startedAt: this.startedAt,
    }
  }
}