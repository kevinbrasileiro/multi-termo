import { useState } from "react"
import { Input } from "../components/generic/Input"
import { socket } from "../socket"
import { useNavigate } from "react-router"
import { Radio } from "../components/generic/Radio"
import { getUsername } from "../main"
import type { GameConfig } from "../../../server/src/game/types"
import Button from "../components/generic/Button"
import Modal from "../components/Modal"

export default function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>({maxPlayers: 2, maxGuesses: 6, mode: "guesses", password: null})
  const [username, setUsername] = useState(getUsername())

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinError, setJoinError] = useState("")

  const navigate = useNavigate()

  const createGame = () => {
    socket.emit("create_game", username, gameConfig, (gameId) => {
      navigate(`/game/${gameId}`)
    })
  }

  const redirectToRandomGame = () => {
    socket.emit("get_random_game", (gameId) => {
      if (!gameId) {
        setJoinError("Nenhum jogo disponível")
        setTimeout(() => setJoinError(""), 2000)
        return
      }
      navigate(`/game/${gameId}`)
    })
  }

  const handleGameConfigChange = (field: string, value: string | number | boolean) => {
    setGameConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-y-16">
      
      <div className="flex flex-col justify-center items-center -mt-24">
        <div className="flex">
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-present">M</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">U</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">L</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-present">T</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">I</div>
        </div>
        <div className="flex">
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-correct">T</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">E</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">R</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-correct">M</div>
          <div className="flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold size-24 text-6xl bg-dark">O</div>
        </div>
      <p className="max-w-md text-center text-lg tracking-widest mt-1 opacity-50">Crie ou entre numa sala e jogue TERMO com seus amigos em tempo real!</p>
      </div>

      <div className="w-72 flex flex-col items-center gap-4 relative">
        <Input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            localStorage.setItem("username", e.target.value)
          }}
          label="Nome de Usuário"
        />

        <div className="w-full flex gap-2">
          <Button variant="primary" size="md" fullWidth onClick={() => setShowCreateModal(true)}>Criar Jogo</Button>
          <Button variant="primary" size="md" fullWidth onClick={redirectToRandomGame}>Entrar Jogo</Button>
        </div>
          {joinError && (
            <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-danger">{joinError}</p>
          )}
      </div>

      <div className="absolute bottom-0 mb-4 left-1/2 -translate-x-1/2 text-xs opacity-50 flex items-center justify-center gap-x-8">
        <a href="https://github.com/kevinbrasileiro" className="cursor-pointer hover:underline" target="_blank">Kevin Brasileiro</a>
        <a href="https://term.ooo" className="cursor-pointer hover:underline" target="_blank">TERMO</a>
        <a href="https://github.com/kevinbrasileiro/multi-termo/issues" className="cursor-pointer hover:underline" target="_blank">Feedback</a>
      </div>

      <Modal isOpen={showCreateModal} handleOutsideClick={() => setShowCreateModal(false)}>
        <div className="w-full h-full flex flex-col gap-4 items-center">

          <div className="w-full flex justify-between gap-4">
            <Input 
              type="number"
              min={1}
              max={99}
              value={gameConfig.maxPlayers}
              onChange={(e) => handleGameConfigChange("maxPlayers", parseFloat(e.target.value))}
              label="nº de Jogadores"
              className="text-center"
            />
            <Input 
              type="number"
              min={3}
              max={9}
              value={gameConfig.maxGuesses}
              onChange={(e) => handleGameConfigChange("maxGuesses", parseFloat(e.target.value))}
              label="Qtde de Tentativas"
              className="text-center"
            />
          </div>

          <Radio 
            name="mode"
            label="Modo de Jogo"
            value={gameConfig.mode}
            onChange={(option) => handleGameConfigChange("mode", option)}
            options={[
              {label: "Tentativas", value: "guesses"},
              {label: "Tempo", value: "timed"},
            ]}
          />

          <div className="w-full">
            <Input 
              type="password"
              value={gameConfig.password || ""}
              onChange={(e) => handleGameConfigChange("password", e.target.value)}
              label="Senha"
            />
            <p className="text-xs opacity-50 mt-1">Deixar vazio fará o jogo ser público</p>
          </div>

          <Button onClick={createGame} size="lg" fullWidth>Criar Jogo</Button>

        </div>
      </Modal>
    </div>
  )
}

