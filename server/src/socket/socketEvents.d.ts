import type { GuessResult } from "../game/wordle.ts";

export type Response = {
  status: "ok" | "error"
  errorMessage?: string
}

export interface ServerToClientEvents {
  broadcast: (message: string) => void
  
  opponent_guess: (amount: number) => void;
}

export interface ClientToServerEvents {
  ping: () => void;

  create_room: (callback: (roomId: string) => void) => void;
  join_room: (roomId: string, callback: (res: Response) => void) => void;

  submit_guess: (guess: string, callback: (res: Response & {guesses: GuessResult[]}) => void) => void
}

// export interface InterServerEvents {
//   ping: () => void;
// }

// export interface SocketData {
//   name: string;
//   age: number;
// }