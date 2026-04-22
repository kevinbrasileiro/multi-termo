import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "../socket";
import { getUsername } from "../main";

export function useJoinGame(gameId: string) {
  const navigate = useNavigate()

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const attemptJoin = useCallback((password: string | null) => {
    socket.emit("join_game", gameId, getUsername(), password, (response) => {
      switch(response) {

        case "ok":
          setShowPasswordModal(false)
          setPasswordError("")
          return
                  
        case "requires_password":
          setShowPasswordModal(true)
          return

        case "invalid_password":
          setPasswordError("Invalid Password")
          return
        
        default:
          console.error(response)
          navigate("/")
          return
        
      }
    })
  }, [gameId, navigate])

  useEffect(() => {
    if (!gameId) return
    attemptJoin(null)

  }, [gameId, attemptJoin])

  const joinWithPassword = () => {
    attemptJoin(password)
  }

  return {
    showPasswordModal,

    password,
    setPassword,
    joinWithPassword,

    passwordError
  }
}