import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { getUsername } from "../main";

export function useJoinGame(gameId: string) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [joinError, setJoinError] = useState("")
  const [isJoining, setIsJoining] = useState(true)

  const attemptJoin = useCallback((password: string | null) => {
    socket.emit("join_game", gameId, getUsername(), password, (response) => {
      setIsJoining(false)
      switch(response) {

        case "ok":
          setShowPasswordModal(false)
          setPasswordError("")
          return
                  
        case "requires_password":
          setShowPasswordModal(true)
          return

        case "invalid_password":
          setPasswordError("Senha Incorreta")
          return

        case "full":
          setJoinError("O jogo está cheio")
          return

        case "already_joined":
          setJoinError("Você já está nesse jogo")
          return

        case "already_started":
          setJoinError("O jogo já começou")
          return
        
        case "not_found":
          setJoinError("O jogo não pôde ser encontrado")
          return
                
      }
    })
  }, [gameId])

  const hasJoinedRef = useRef(false)

  useEffect(() => {
    if (!gameId || hasJoinedRef.current) return

    hasJoinedRef.current = true
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

    passwordError,
    joinError,
    isJoining
  }
}