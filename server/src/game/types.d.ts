import type { Game } from "./Game.ts"

export type GuessResult = {letter: string, result: "correct" | "present" | "wrong" | "empty"}[]

export type PlayerInfo = {
  username: string
  guesses: GuessResult[]
  score: { round: number; total: number }
  win: number | null
  votedRematch: boolean
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
}

export type JoinGameResponse = "ok" | "not_found" | "full" | "already_started" | "requires_password" | "invalid_password"

export type SubmitGuessRespone = "ok" | "not_found" | "not_on_game" | "game_not_playing" | "player_already_won" | "guess_limit_reached" | "incorrect_length" | "not_on_wordlist"
