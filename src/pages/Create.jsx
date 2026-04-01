import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { generateRoomCode } from '../lib/roomCode.js'
import { getDefaultPack, getPlayableScenarios } from '../lib/scenarios.js'
import styles from './Create.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.3 } }
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

    const pack = getDefaultPack()
    const tryInsert = async (roomCode) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          room_code: roomCode,
          total_rounds: getPlayableScenarios(pack).length,
          pack_id: pack.id,
          world_state: pack.defaultWorldState ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }
        })
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
        setError('SESSION CREATION FAILED')
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
      <h1 className={styles.title}>SIGNAL LOST</h1>
      <p className={styles.subtitle}>COMMAND CENTER</p>

      <button
        className={styles.btn}
        onClick={createSession}
        disabled={loading}
      >
        {loading ? 'INITIALIZING...' : 'CREATE SESSION'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </motion.div>
  )
}
