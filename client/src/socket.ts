import { io, Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "../../server/src/socket/socketEvents"

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000")
