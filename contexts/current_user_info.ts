import React, { createContext } from 'react'
import { UserInfo } from 'types/global'

const CurrentUserInfoContext = createContext({} as {
  currentUserInfo: UserInfo | null,
  setCurrentUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>,
})

export default CurrentUserInfoContext
