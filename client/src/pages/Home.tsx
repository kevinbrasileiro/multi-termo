import { socket } from "../socket"
import { useNavigate } from "react-router"

export default function App() {
  const navigate = useNavigate()

  const createRoom = () => {
    socket.emit("create_room", (roomId) => {
      navigate(`/room/${roomId}`)
    })
  }

  return (
    <button onClick={createRoom}>Create Room</button>
  )
}

