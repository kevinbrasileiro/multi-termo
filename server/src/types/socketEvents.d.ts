export interface ServerToClientEvents {
  broadcast: (message: string) => void;

  room_created: (roomId: string) => void;

  guess_result: (result: string) => void;
}

export interface ClientToServerEvents {
  ping: () => void;

  create_room: () => void;
  join_room: (roomId: string) => void;

  submit_guess: (guess: string) => void;
}

// export interface InterServerEvents {
//   ping: () => void;
// }

// export interface SocketData {
//   name: string;
//   age: number;
// }