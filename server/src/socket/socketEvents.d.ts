import type { Game, JoinGameRespose } from "../game/games.ts"
import type { GuessResult } from "../game/wordle.ts"

export type Response = {
  status: "ok" | "error"
  errorMessage?: string
}

export interface ServerToClientEvents {
  broadcast: (message: string) => void
  
  update_game_state: (gameState: {players: Game["players"], status: Game["status"], config: Game["config"], word: string}) => void
}

export interface ClientToServerEvents {
  ping: () => void

  create_game: (username: string, config: Game["config"], callback: (gameId: string) => void) => void
  join_game: (gameId: string, username: string, password: string | null, callback: (res: JoinGameRespose) => void) => void

  submit_guess: (guess: string, callback: (res: Response & {guesses: GuessResult[]}) => void) => void
  vote_rematch: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  gameId: string
}