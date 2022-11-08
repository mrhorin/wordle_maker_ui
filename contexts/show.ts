import React, { createContext } from 'react'

const ShowContext = createContext({} as {
  showAccountMenu: boolean,
  setShowAccountMenu: React.Dispatch<React.SetStateAction<boolean>>
  showSlideoutMenu: boolean,
  setSlideoutMenu: React.Dispatch<React.SetStateAction<boolean>>
})

export default ShowContext
