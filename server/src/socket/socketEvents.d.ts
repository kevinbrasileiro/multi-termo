import type { GameConfig, GameState, JoinGameResponse, SubmitGuessResponse } from "../game/types.js"

export interface ServerToClientEvents {
  broadcast: (message: string) => void
  
  update_game_state: (gameState: GameState) => void
}

export interface ClientToServerEvents {
  ping: () => void

  create_game: (config: GameConfig, callback: (gameId: string) => void) => void
  join_game: (gameId: string, username: string, password: string | null, callback: (res: JoinGameResponse) => void) => void
  get_random_game: (callback: (gameId: string) => void) => void

  leave_game: () => void

  submit_guess: (guess: string, callback: (res: SubmitGuessResponse) => void) => void
  vote_rematch: () => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  gameId: string
  playerId: string
}