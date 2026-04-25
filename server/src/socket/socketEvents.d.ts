import type { Game, JoinGameRespose } from "../game/GamesManager.ts"
import type { SubmitGuessRespone } from "../game/types.js"
import type { GuessResult } from "../game/wordle.ts"

export interface ServerToClientEvents {
  broadcast: (message: string) => void
  
  update_game_state: (gameState: GameStateType) => void
}

export interface ClientToServerEvents {
  ping: () => void

  create_game: (username: string, config: Game["config"], callback: (gameId: string) => void) => void
  join_game: (gameId: string, username: string, password: string | null, callback: (res: JoinGameRespose) => void) => void

  submit_guess: (guess: string, callback: (res: SubmitGuessRespone) => void) => void
  vote_rematch: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  gameId: string
}