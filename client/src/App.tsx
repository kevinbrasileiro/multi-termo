import { useEffect } from "react"
import { socket } from "./socket"

export default function App() {
  useEffect(() => {
    socket.on("room_created", (roomId) => {
      console.log(roomId)
    })

    socket.on("broadcast", (message) => {
      console.log(message)
    })

    return () => {
      socket.off("room_created")
      socket.off("broadcast")
    }
  }, [])

  const createRoom = () => {
    socket.emit("create_room")
  }

  return (
    <button onClick={createRoom}>Create Room</button>
  )
}

