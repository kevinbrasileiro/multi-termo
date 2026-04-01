import { useEffect } from "react"
import { socket } from "../socket"
import { useNavigate } from "react-router"

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    socket.on("room_created", (roomId) => {
      navigate(`/room/${roomId}`)
    })

    return () => {
      socket.off("room_created")
    }
  }, [navigate])

  const createRoom = () => {
    socket.emit("create_room")
  }

  return (
    <button onClick={createRoom}>Create Room</button>
  )
}

