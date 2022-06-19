import React, { useState, useLayoutEffect } from 'react'
import { useRouter } from 'next/router'

// useHash
export default (defaultHash?: string): [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] => {
  const [currentHash, setCurrentHash] = useState<string | undefined>(defaultHash)

  const router = useRouter()

  useLayoutEffect(() => {
    // Bind hashChangeStart event
    const handleHashChangeStart = (url: string) => {
      setCurrentHash(url.split('#')[1])
    }
    router.events.on('hashChangeStart', handleHashChangeStart);
    return () => {
      router.events.off('hashChangeStart', handleHashChangeStart)
    }
  }, [router.events])

  return [currentHash, setCurrentHash]
}
