import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { assignClassroomProfiles } from '../lib/senatorProfiles.js'
import styles from './Landing.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.3 } }
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

  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('code') ?? ''
  })
  const [name, setName] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  async function joinSession() {
    setJoinLoading(true)
    setJoinError('')

    const { data: session } = await supabase
      .from('sessions')
      .select('id, status, pack_id')
      .eq('room_code', code.trim())
      .maybeSingle()

    if (!session) {
      setJoinError('SESSION NOT FOUND')
      setJoinLoading(false)
      return
    }

    if (session.status !== 'lobby') {
      setJoinError('SESSION ALREADY ACTIVE')
      setJoinLoading(false)
      return
    }

    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]

    let senatorProfileId = null
    if (session.pack_id === 'signal-lost') {
      const { count } = await supabase
        .from('players')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)
      const profiles = assignClassroomProfiles((count ?? 0) + 1)
      senatorProfileId = profiles[count ?? 0].id
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        session_id: session.id,
        name: name.trim(),
        avatar,
        ...(senatorProfileId ? { senator_profile_id: senatorProfileId } : {})
      })
      .select()
      .single()

    if (playerError) {
      setJoinError('CONNECTION FAILED')
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
      <h1 className={styles.title}>SIGNAL LOST</h1>
      <p className={styles.statusLine}>
        <span className={styles.statusDot} />
        SYSTEM STATUS: READY
      </p>

      <div className={styles.joinCard}>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="ACCESS CODE"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          disabled={joinLoading}
          autoFocus
        />
        <input
          className={styles.input}
          type="text"
          placeholder="IDENTIFICATION"
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
          {joinLoading ? 'CONNECTING...' : 'AUTHENTICATE'}
        </button>
        {joinError && <p className={styles.error}>{joinError}</p>}
      </div>
    </motion.div>
  )
}
