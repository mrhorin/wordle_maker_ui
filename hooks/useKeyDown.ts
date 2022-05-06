import { useEffect } from 'react'

export const useKeyDown = (callback: (event: KeyboardEvent) => void) => {

  useEffect(() => {
    window.onkeydown = callback
  }, [])

}