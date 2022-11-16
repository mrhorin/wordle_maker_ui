import type { User, AccountStatus } from 'types/global'
import React, { createContext } from 'react'

const AccountContext = createContext({} as {
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  status: AccountStatus,
  setStatus: React.Dispatch<React.SetStateAction<AccountStatus>>
})

export default AccountContext
