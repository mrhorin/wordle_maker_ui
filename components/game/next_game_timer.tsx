import { useState, useEffect } from 'react'

const NextGameTimer = () => {
  const [now, setNow] = useState<Date>()
  const [expiry, setExpiry] = useState<Date>()

  // Prevent 'Text content did not match' error
  useEffect(() => {
    const now: Date = new Date()
    setNow(now)
    setExpiry(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  }, [])

  useEffect(() => {
    if (now && expiry && expiry > now) setTimeout(() => { setNow(new Date()) }, 1000)
  }, [now])

  const hours = now ? ('00' + (23 - now.getHours())).slice(-2) : '00'
  const mins = now ? ('00' + (59 - now.getMinutes())).slice(-2) : '00'
  const secs = now ? ('00' + (59 - now.getSeconds())).slice(-2) : '00'

  return (
    <div className='timer'>
      <div className='timer-label'>Next Game</div>
      <div className='timer-clock'>{`${hours}:${mins}:${secs}`}</div>
    </div>
  )
}

export default NextGameTimer