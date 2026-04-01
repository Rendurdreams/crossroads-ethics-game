import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { getDefaultPack, getPlayableScenarios } from '../lib/scenarios.js'
import styles from './HostSetup.module.css'

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 1.05, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }
}

export default function HostSetup() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [mode, setMode] = useState('discussion')

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }

    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/')
          return
        }
        setSession(data)
        setLoading(false)
      })
  }, [sessionId, navigate])

  async function openLobby() {
    setOpening(true)
    const pack = getDefaultPack()
    const totalRounds = getPlayableScenarios(pack).length
    const defaultWorld = pack.defaultWorldState ?? { trust: 50, courage: 50, solidarity: 50, awareness: 50 }
    const { error } = await supabase
      .from('sessions')
      .update({ pack_id: pack.id, total_rounds: totalRounds, world_state: defaultWorld, mode })
      .eq('id', sessionId)
    if (error) {
      console.error('Failed to set pack:', error)
      setOpening(false)
      return
    }
    navigate(`/host/${sessionId}`)
  }

  if (loading) {
    return (
      <motion.div
        className={styles.page}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <p className={styles.loading}>Loading...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={styles.page}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h1 className={styles.heading}>SIGNAL LOST &middot; COMMAND CENTER</h1>

      <p className={styles.roomLabel}>ACCESS CODE</p>
      <div className={styles.roomCode}>{session?.room_code}</div>

      <div className={styles.qrCode}>
        <QRCodeSVG
          value={`${window.location.origin}/?code=${session.room_code}`}
          size={220}
          bgColor="transparent"
          fgColor="#3b82f6"
        />
      </div>
      <p className={styles.qrInstruction}>Scan to join on your phone</p>

      <p className={styles.instructions}>
        Share the access code. Initialize when your senators are connected.
      </p>

      <div className={styles.modeSelector}>
        <p className={styles.modeLabel}>SESSION MODE</p>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'discussion' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('discussion')}
          >
            Discussion
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'standard' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('standard')}
          >
            Standard
          </button>
        </div>
        <p className={styles.modeHint}>
          {mode === 'discussion'
            ? 'Facilitator-paced. Discussion pause between rounds.'
            : 'Continuous play. No pauses.'}
        </p>
      </div>

      <button
        className={styles.openBtn}
        onClick={openLobby}
        disabled={opening}
      >
        {opening ? 'INITIALIZING...' : 'INITIALIZE SESSION'}
      </button>
    </motion.div>
  )
}
