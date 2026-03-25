import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PlayerRoster from '../components/PlayerRoster.jsx'
import styles from './Host.module.css'

export default function Host() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [players, setPlayers] = useState([])
  const [totalRounds, setTotalRounds] = useState(4)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    // 1. Fetch session row
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

    // 2. Fetch existing players (BEFORE subscription to avoid race)
    supabase
      .from('players')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => {
        setPlayers(data ?? [])
      })

    // 3. Subscribe to new player joins
    const channel = supabase.channel(`players:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          // Dedup: prevent race condition where fetch + subscription both deliver the same player
          setPlayers(prev =>
            prev.some(p => p.id === payload.new.id)
              ? prev
              : [...prev, payload.new]
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [sessionId, navigate])

  async function startGame() {
    await supabase
      .from('sessions')
      .update({ status: 'active', total_rounds: totalRounds, current_round: 1 })
      .eq('id', sessionId)
    setStarted(true)
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
      <p className={styles.roomLabel}>ROOM CODE</p>
      <div className={styles.roomCode}>{session?.room_code}</div>

      <div className={styles.content}>
        <PlayerRoster players={players} />
        <p className={styles.playerCount}>{players.length} player(s) joined</p>

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

        {started ? (
          <p className={styles.started}>Game started — players are in!</p>
        ) : (
          <button
            className={styles.startBtn}
            disabled={players.length < 2}
            onClick={startGame}
          >
            Start Game ({players.length} player{players.length !== 1 ? 's' : ''})
          </button>
        )}
      </div>
    </div>
  )
}
