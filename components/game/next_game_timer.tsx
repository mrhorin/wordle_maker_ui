import { useState, useEffect } from 'react'

const NextGameTimer = () => {
  const [now, setNow] = useState<Date>(new Date())
  const [expiry] = useState<Date>(() => {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  })

  useEffect(() => {
    if (expiry > now) setTimeout(() => { setNow(new Date()) }, 1000)
  }, [now])

  const hours = ('00' + (23 - now.getHours())).slice(-2)
  const mins = ('00' + (59 - now.getMinutes())).slice(-2)
  const secs = ('00' + (59 - now.getSeconds())).slice(-2)

  return (
    <div className='timer'>
      <div className='timer-label'>Next Game</div>
      <div className='timer-clock'>{`${hours}:${mins}:${secs}`}</div>
    </div>
  )
}

export default NextGameTimer