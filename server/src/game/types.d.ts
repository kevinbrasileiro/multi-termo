import type { Game } from "./Game.ts"

export type GuessResult = {letter: string, result: "correct" | "present" | "wrong" | "empty"}[]

export type PlayerInfo = {
  username: string
  guesses: GuessResult[]
  score: { round: number; total: number }
  win: number | null // timestamp
  votedRematch: boolean
  connected: boolean
}

export type GameConfig = {
  maxPlayers: number
  maxGuesses: number
  mode: "timed" | "guesses"
  private: boolean
  password: string | null
}

export type GameState = {
  players: Game["players"],
  status: Game["status"],
  word: Game["word"]
  config: GameConfig,
  startedAt: Game["startedAt"]
}

export type JoinGameResponse = "ok" | "already_joined" | "not_found" | "full" | "already_started" | "requires_password" | "invalid_password"

export type SubmitGuessResponse =
  | { status: "ok"; guesses: GuessResult[] }
  | { status: "not_found" }
  | { status: "not_on_game" }
  | { status: "game_not_playing" }
  | { status: "player_already_won" }
  | { status: "guess_limit_reached" }
  | { status: "incorrect_length" }
  | { status: "not_on_wordlist" }

