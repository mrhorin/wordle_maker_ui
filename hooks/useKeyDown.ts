import { useEffect } from 'react'

export const useKeyDown = (callback: (event: KeyboardEvent) => void, source: any[]) => {

  useEffect(() => {
    window.onkeydown = callback
  }, source)

}