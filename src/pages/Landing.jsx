import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { generateRoomCode } from '../lib/roomCode.js'
import { getDefaultPack, getPlayableScenarios } from '../lib/scenarios.js'
import styles from './Landing.module.css'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}

const AVATARS = [
  '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F981}',
  '\u{1F42F}', '\u{1F984}', '\u{1F438}', '\u{1F419}',
  '\u{1F98B}', '\u{1F980}', '\u{1F42C}', '\u{1F989}',
  '\u{1F43A}', '\u{1F994}', '\u{1F427}', '\u{1F431}'
]

export default function Landing() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  // Host state
  const [hostLoading, setHostLoading] = useState(false)
  const [hostError, setHostError] = useState('')

  // Player state
  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('code') ?? ''
  })
  const [name, setName] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function createSession() {
    setHostLoading(true)
    setHostError('')

    const tryInsert = async (roomCode) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ room_code: roomCode, total_rounds: getPlayableScenarios(getDefaultPack()).length })
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

    navigate(`/baseline/${session.id}`)
  }

  const joinEnabled = code.length === 4 && name.trim().length > 0 && !joinLoading

  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <svg
        width="64"
        height="72"
        viewBox="0 0 64 72"
        aria-hidden="true"
        style={{ display: 'block', margin: '0 auto 16px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heraldic shield outline */}
        <path
          d="M 4 4 L 60 4 L 60 44 Q 60 68 32 68 Q 4 68 4 44 Z"
          fill="rgba(245,158,11,0.7)"
        />
        {/* Crossroads X motif */}
        <line x1="16" y1="16" x2="48" y2="52" stroke="#0a0a14" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="48" y1="16" x2="16" y2="52" stroke="#0a0a14" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <h1 className={styles.title}>The Crossroads</h1>
      <p className={styles.subtitle}>A kingdom awaits your judgment</p>

      <div className={styles.splitContainer}>
        {/* Host path */}
        <div className={styles.pathCard}>
          <h2 className={styles.pathHeading}>Convene</h2>
          <p className={styles.pathDescription}>Create a new council chamber. You will be the ruler.</p>
          <button
            className={styles.btn}
            onClick={createSession}
            disabled={hostLoading}
          >
            {hostLoading ? 'Summoning...' : 'Create Chamber'}
          </button>
          {hostError && <p className={styles.error}>{hostError}</p>}
        </div>

        <div className={styles.pathDivider}>
          <span className={styles.pathDividerText}>or</span>
        </div>

        {/* Player path */}
        <div className={styles.pathCard}>
          <h2 className={styles.pathHeading}>Enter</h2>
          <p className={styles.pathDescription}>Join an existing council. Enter your chamber code.</p>
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
            {joinLoading ? 'Entering...' : 'Enter Council'}
          </button>
          {joinError && <p className={styles.error}>{joinError}</p>}
        </div>
      </div>
    </motion.div>
  )
}
