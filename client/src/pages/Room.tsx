import { useEffect, useState } from "react"
import { socket } from "../socket"
import { useParams } from "react-router"

export default function Room() {
  const [guess, setGuess] = useState("")
  const params = useParams()

  useEffect(() => {
    socket.on("broadcast", (message) => {
      console.log(message)
    })

    if (params.roomId) {
      socket.emit("join_room", params.roomId)
    }

    return () => {
      socket.off("broadcast")
    }
  }, [params.roomId])

  const submitGuess = () => {
    socket.emit("submit_guess", guess)
  }

  return (
    <div>
      <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)}/>
      <button onClick={submitGuess}>Guess</button>
    </div>
  )
}

