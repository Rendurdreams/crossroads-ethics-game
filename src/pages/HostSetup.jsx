import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase.js'
import styles from './HostSetup.module.css'

export default function HostSetup() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [totalRounds, setTotalRounds] = useState(4)
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState(false)

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
        setTotalRounds(data.total_rounds || 4)
        setLoading(false)
      })
  }, [sessionId, navigate])

  async function openLobby() {
    setOpening(true)
    await supabase
      .from('sessions')
      .update({ total_rounds: totalRounds })
      .eq('id', sessionId)
    navigate(`/host/${sessionId}`)
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>You're the host.</h1>

      <p className={styles.roomLabel}>ROOM CODE</p>
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
        Share the room code. When your class is ready, open the lobby.
      </p>

      <div className={styles.roundSelector}>
        <span className={styles.roundLabel}>Rounds</span>
        {[3, 4, 5, 6].map(n => (
          <button
            key={n}
            className={
              n === totalRounds
                ? `${styles.roundBtn} ${styles.roundBtnActive}`
                : `${styles.roundBtn} ${styles.roundBtnInactive}`
            }
            onClick={() => setTotalRounds(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        className={styles.openBtn}
        onClick={openLobby}
        disabled={opening}
      >
        {opening ? 'Opening...' : 'Open Lobby'}
      </button>
    </div>
  )
}
