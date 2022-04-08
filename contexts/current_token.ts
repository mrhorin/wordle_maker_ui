import React, { createContext } from 'react'
import { Token } from 'types/global'

const CurrentTokenContext = createContext({} as {
  currentToken: Token | null,
  setCurrentToken: React.Dispatch<React.SetStateAction<Token | null>>,
  destroyTokenCookies: () => void
})

export default CurrentTokenContext
