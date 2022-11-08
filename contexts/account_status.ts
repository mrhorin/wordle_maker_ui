import type { AccountStatus } from 'types/global'
import React, { createContext } from 'react'

const AccountStatusContext = createContext({} as {
  accountStatus: AccountStatus,
  setAccountStatus: React.Dispatch<React.SetStateAction<AccountStatus>>
})

export default AccountStatusContext
