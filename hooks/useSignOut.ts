import type { Token } from 'types/global'
import { useContext } from 'react'

import CurrentUserInfoContext from 'contexts/current_user_info'

import { ClientSideCookies } from 'scripts/cookie'
import { deleteSignOut } from 'scripts/api'
import validate from 'scripts/validate'

export default () => {
  const currentUserInfoContext = useContext(CurrentUserInfoContext)

  const destroyContexts = () => {
    currentUserInfoContext.setCurrentUserInfo(null)
  }

  const destroyCookies = () => {
    ClientSideCookies.destroyToken()
    ClientSideCookies.destroyUserInfo()
  }

  const signOut = (callback?: () => void): void => {
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      deleteSignOut(token).then(json => {
        if (!json.success) console.error(json)
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        destroyContexts()
        destroyCookies()
        if (callback) callback()
      })
    } else {
      destroyContexts()
      destroyCookies()
      if (callback) callback()
    }
  }

  return signOut
}
