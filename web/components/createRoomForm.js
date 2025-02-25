import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { joinSchema } from '@/libs/yup'
import { useEffect, useState, useContext } from 'react'
import { socket } from '@/libs/web-sockets'
import { useRouter } from 'next/router'
import { PlayerContext } from '@/context/PlayerContext'
import { RoomContext } from '@/context/RoomContext'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Error from '@/components/common/Error'

const CreateRoomForm = () => {
  const [errorMessageOnResponse, setErrorMessageOnResponse] = useState('')
  const { playerData, setPlayerData } = useContext(PlayerContext)
  const { setRoomPlayers } = useContext(RoomContext)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(joinSchema) })
  const router = useRouter()

  useEffect(() => {
    // set playerData back to empty object when component has mounted
    let mounted = false

    if (!mounted && Object.keys(playerData).length > 0) {
      mounted = true
      setPlayerData({})
    }
  }, [])

  useEffect(() => {
    const messageTimer = () =>
      setTimeout(() => {
        setErrorMessageOnResponse('')
      }, 3000)

    return () => clearTimeout(messageTimer)
  }, [errorMessageOnResponse])

  const onSubmit = (data) => {
    try {
      socket.emit('CREATE_ROOM', data, (response) => {
        if (response?.status === '403') {
          setErrorMessageOnResponse(response.message)
        } else {
          socket.on('SET_PLAYER_DATA', ({ playerData }) => {
            setPlayerData(playerData)
          })
          socket.on('SET_ROOM_INFO', (data) => {
            setRoomPlayers(data.players)
            router.push(`/room/${data.roomId}`)
          })
        }
      })
    } catch (error) {
      setErrorMessageOnResponse(JSON.parse(error.message))
    }
  }

  return (
    <form
      className="flex flex-col items-center gap-4"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        type="text"
        placeholder="Podaj swoją nazwę"
        error={errors?.username?.message}
        {...register('username')}
      />
      <Input
        type="text"
        placeholder="Utwórz kod pokoju (4 znaki)"
        error={errors?.roomId?.message}
        {...register('roomId')}
      />
      <div className="flex gap-4">
        <Button type="submit" variant="primary" color="yellow" className="mt-2">
          Utwórz pokój
        </Button>
        <Button
          variant="primary"
          color="blue"
          className="mt-2"
          target="_blank"
          link="https://discord.gg/HYsRmJVjSW"
        >
          Dołącz do Discorda
        </Button>
      </div>

      {errorMessageOnResponse && <Error>{errorMessageOnResponse}</Error>}
    </form>
  )
}

export default CreateRoomForm
