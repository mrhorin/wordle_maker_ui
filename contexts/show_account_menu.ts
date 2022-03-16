import React, { createContext } from 'react'

const ShowAccountMenuContext = createContext({} as {
  showAccountMenu: boolean,
  setShowAccountMenu: React.Dispatch<React.SetStateAction<boolean>>
})

export default ShowAccountMenuContext
