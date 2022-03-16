import React, { createContext } from 'react'
import { UserInfo } from '../types/global'

const CurrentUserInfoContext = createContext({} as {
  currentUserInfo: UserInfo | undefined,
  setCurrentUserInfo: React.Dispatch<React.SetStateAction<UserInfo | undefined>>
})

export default CurrentUserInfoContext
