import { io, Socket } from "socket.io-client"
import type { ServerToClientEvents, ClientToServerEvents } from "../../server/src/socket/socketEvents"

export const getPlayerId = () => {
  const playerId = localStorage.getItem("playerId")

  if (!playerId) {
    const newPlayerId = crypto.randomUUID()
    localStorage.setItem("playerId", newPlayerId)
    return newPlayerId
  }

  return playerId
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_API_URL, {
  auth: {
    playerId: getPlayerId()
  }
})
