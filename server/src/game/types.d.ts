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
  password: string | null
}

export type GameState = {
  players: Game["players"],
  status: Game["status"],
  word: Game["word"]
  config: GameConfig,
}

export type JoinGameResponse = "ok" | "not_found" | "full" | "already_started" | "requires_password" | "invalid_password"

export type SubmitGuessRespone = 
  {status: "ok", guesses: GuessResult[]} 
  | {status: "not_on_game"} 
  | {status: "game_not_playing"} 
  | {status: "player_already_won"} 
  | {status: "guess_limit_reached"} 
  | {status: "incorrect_length"} 
  | {status: "not_on_wordlist"}
