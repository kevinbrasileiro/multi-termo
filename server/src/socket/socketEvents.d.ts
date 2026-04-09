import type { Game } from "../game/games.ts";
import type { GuessResult } from "../game/wordle.ts";

export type Response = {
  status: "ok" | "error"
  errorMessage?: string
}

export interface ServerToClientEvents {
  broadcast: (message: string) => void
  
  update_game_state: (gameState: {players: Game["players"], status: Game["status"]}) => void
}

export interface ClientToServerEvents {
  ping: () => void;

  create_game: (callback: (gameId: string) => void) => void;
  join_game: (gameId: string, callback: (res: Response) => void) => void;

  submit_guess: (guess: string, callback: (res: Response & {guesses: GuessResult[]}) => void) => void
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  gameId: string;
}