import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { motion, useReducedMotion } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { packs, getPackById, getPlayableScenarios } from '../lib/scenarios.js'
import styles from './HostSetup.module.css'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }
}

export default function HostSetup() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const variants = shouldReduce ? { initial: {}, animate: {}, exit: {} } : pageVariants

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)
  const [selectedPackId, setSelectedPackId] = useState('kingdom-arc')

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
    const selectedPack = getPackById(selectedPackId)
    const totalRounds = getPlayableScenarios(selectedPack).length + 1  // playable + reflection
    const { error } = await supabase
      .from('sessions')
      .update({ pack_id: selectedPackId, total_rounds: totalRounds })
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
      <h1 className={styles.heading}>The council awaits.</h1>

      <p className={styles.roomLabel}>CHAMBER CODE</p>
      <div className={styles.roomCode}>{session?.room_code}</div>

      <div className={styles.qrCode}>
        <QRCodeSVG
          value={`${window.location.origin}/?code=${session.room_code}`}
          size={180}
          bgColor="#12121e"
          fgColor="#f5f0e8"
        />
      </div>
      <p className={styles.qrInstruction}>Scan to join on your phone</p>

      <p className={styles.instructions}>
        Share the code. When your council is assembled, open the chamber.
      </p>

      <div className={styles.packRow}>
        {packs.map(p => (
          <button
            key={p.id}
            className={`${styles.packCard} ${p.id === selectedPackId ? styles.packCardSelected : styles.packCardUnselected}`}
            onClick={() => setSelectedPackId(p.id)}
            type="button"
          >
            <h2 className={styles.packName}>{p.name}</h2>
            <p className={styles.packCount}>{getPlayableScenarios(p).length} dilemmas</p>
            <p className={styles.packSetting}>{p.setting}</p>
            <div className={styles.packDivider} />
            <p className={styles.packDescription}>{p.description}</p>
          </button>
        ))}
      </div>

      <button
        className={styles.openBtn}
        onClick={openLobby}
        disabled={opening}
      >
        {opening ? 'Opening...' : 'Open the Gates'}
      </button>
    </motion.div>
  )
}
