import { createHash } from "node:crypto";
import { evaluateGuess, generateRandomWord, guessExists } from "./wordle.js";
import type { GameConfig, GameState, JoinGameResponse, PlayerInfo, SubmitGuessRespone } from "./types.js";

const MAX_ALLOWED_PLAYERS = 99

const MIN_ALLOWED_GUESSES = 3
const MAX_ALLOWED_GUESSES = 9

export class Game {
  id: string
  players: Record<string, PlayerInfo> = {}
  word = ""
  status: "waiting" | "playing" | "finished" = "waiting"
  config: GameConfig

  constructor(id: string, playerId: string, username: string, config: GameConfig) {
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

    this.players[playerId] = this.createPlayer(username)

    if (this.config.maxPlayers <= 1) {
      this.start()
    }
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
    if (this.players[playerId]) return "ok"
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
    const player = this.players[playerId]
    if (!player) return

    player.votedRematch = true

    const allVoted = Object.values(this.players).every(player => player.votedRematch)

    if (allVoted) this.start()
  }

  submitGuess(playerId: string, guess: string): SubmitGuessRespone {
    const player = this.players[playerId]
    if (!player) return  "not_on_game"

    if (this.status !== "playing") return  "game_not_playing"
    if (player.win) return  "player_already_won"
    if (player.guesses.length >= this.config.maxGuesses) return  "guess_limit_reached"

    const normalizedGuess = guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    
    if (normalizedGuess.length !== 5) return  "incorrect_length"
    if (!guessExists(normalizedGuess)) return  "not_on_wordlist"

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

    return "ok"
  }

  private checkAndSortWinners() {
    if (this.status !== "playing") return
    
    const players = Object.entries(this.players)

    const finishedPlayers = players.filter(([, player]) => {
      return player.win !== null || player.guesses.length >= this.config.maxGuesses
    })

    if (finishedPlayers.length < players.length) return

    return finishedPlayers.sort((a, b) => {
      const playerA = a[1]
      const playerB = b[1]

      if (this.config.mode === "guesses" && (playerA.guesses.length !== playerB.guesses.length)) {
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

  getFormattedGameState(playerId: string): GameState {
    console.dir(this)

    return {
      players: Object.fromEntries(
        Object.entries(this.players).map(([id, player]) => {
          const isOwner = id === playerId

          return [id,
            {...player, guesses: player.guesses.map((guess) =>
              isOwner ? guess : guess.map((guess) => ({
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
    }
  }
}