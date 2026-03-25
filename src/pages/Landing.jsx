import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { generateRoomCode } from '../lib/roomCode.js'
import styles from './Landing.module.css'

const AVATARS = [
  '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F981}',
  '\u{1F42F}', '\u{1F984}', '\u{1F438}', '\u{1F419}',
  '\u{1F98B}', '\u{1F980}', '\u{1F42C}', '\u{1F989}',
  '\u{1F43A}', '\u{1F994}', '\u{1F427}', '\u{1F431}'
]

export default function Landing() {
  const navigate = useNavigate()

  // Host state
  const [hostLoading, setHostLoading] = useState(false)
  const [hostError, setHostError] = useState('')

  // Player state
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function createSession() {
    setHostLoading(true)
    setHostError('')

    const tryInsert = async (roomCode) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ room_code: roomCode })
        .select()
        .single()
      return { data, error }
    }

    const firstCode = generateRoomCode()
    let result = await tryInsert(firstCode)

    if (result.error) {
      // Retry once on unique constraint collision
      const secondCode = generateRoomCode()
      result = await tryInsert(secondCode)
      if (result.error) {
        console.error('createSession failed:', result.error)
        setHostError('Failed to create session. Try again.')
        setHostLoading(false)
        return
      }
    }

    navigate(`/host-setup/${result.data.id}`)
  }

  async function joinSession() {
    setJoinLoading(true)
    setJoinError('')

    const { data: session } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('room_code', code.trim())
      .maybeSingle()

    if (!session) {
      setJoinError('Room not found. Check the code and try again.')
      setJoinLoading(false)
      return
    }

    if (session.status !== 'lobby') {
      setJoinError('This game has already started.')
      setJoinLoading(false)
      return
    }

    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({ session_id: session.id, name: name.trim(), avatar })
      .select()
      .single()

    if (playerError) {
      setJoinError('Failed to join. Try again.')
      setJoinLoading(false)
      return
    }

    localStorage.setItem('player_id', player.id)
    localStorage.setItem('session_id', session.id)

    navigate(`/play/${session.id}`)
  }

  const joinEnabled = code.length === 4 && name.trim().length > 0 && !joinLoading

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>The Crossroads</h1>
      <p className={styles.subtitle}>A Multiplayer Ethics Game</p>

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Host a Game</h2>
        <button
          className={styles.btn}
          onClick={createSession}
          disabled={hostLoading}
        >
          {hostLoading ? 'Creating...' : 'Create Game'}
        </button>
        {hostError && <p className={styles.error}>{hostError}</p>}
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Join a Game</h2>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Room Code"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          disabled={joinLoading}
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Your Name"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={joinLoading}
        />
        <button
          className={styles.btn}
          onClick={joinSession}
          disabled={!joinEnabled}
        >
          {joinLoading ? 'Joining...' : 'Join'}
        </button>
        {joinError && <p className={styles.error}>{joinError}</p>}
      </div>
    </div>
  )
}
