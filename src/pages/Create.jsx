import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { generateRoomCode } from '../lib/roomCode.js'
import { getDefaultPack, getPlayableScenarios } from '../lib/scenarios.js'
import homescreenBg from '../assets/Homescreen.png'
import styles from './Create.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }
}

export default function Create() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createSession() {
    setLoading(true)
    setError('')

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
      const secondCode = generateRoomCode()
      result = await tryInsert(secondCode)
      if (result.error) {
        console.error('createSession failed:', result.error)
        setError('Failed to create session. Try again.')
        setLoading(false)
        return
      }
    }

    navigate(`/host-setup/${result.data.id}`)
  }

  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={styles.bg} style={{ backgroundImage: `url(${homescreenBg})` }} />
      <svg
        width="64"
        height="72"
        viewBox="0 0 64 72"
        aria-hidden="true"
        style={{ display: 'block', margin: '0 auto 16px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 4 L 60 4 L 60 44 Q 60 68 32 68 Q 4 68 4 44 Z"
          fill="rgba(245,158,11,0.7)"
        />
        <line x1="16" y1="16" x2="48" y2="52" stroke="#0a0a14" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="48" y1="16" x2="16" y2="52" stroke="#0a0a14" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <h1 className={styles.title}>The Crossroads</h1>
      <p className={styles.subtitle}>Convene the council</p>

      <button
        className={styles.btn}
        onClick={createSession}
        disabled={loading}
      >
        {loading ? 'Summoning...' : 'Create Chamber'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </motion.div>
  )
}
