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
    if (now && expiry && expiry > now) {
    // Save intervalId to clear the interval when the component re-renders
      const countDownInterval = setInterval(() => { setNow(new Date()) }, 1000)
      // Clear interval on re-render to avoid memory leaks
      return () => clearInterval(countDownInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  const hours: string = now ? ('00' + (23 - now.getHours())).slice(-2) : '00'
  const mins: string = now ? ('00' + (59 - now.getMinutes())).slice(-2) : '00'
  const secs: string = now ? ('00' + (59 - now.getSeconds())).slice(-2) : '00'
  const clock = now?.getHours() == 0 && now?.getMinutes() == 0 && now?.getSeconds() == 0 ? '00:00:00' : `${hours}:${mins}:${secs}`

  return (
    <div className='timer'>
      <div className='timer-label'>Next Game</div>
      <div className='timer-clock'>{clock}</div>
    </div>
  )
}

export default NextGameTimer