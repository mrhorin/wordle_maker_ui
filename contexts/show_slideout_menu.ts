import React, { createContext } from 'react'

const ShowSlideoutMenuContext = createContext({} as {
  show: boolean,
  set: React.Dispatch<React.SetStateAction<boolean>>
})

export default ShowSlideoutMenuContext
