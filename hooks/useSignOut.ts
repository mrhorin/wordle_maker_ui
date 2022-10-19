import type { Token } from 'types/global'
import { useContext } from 'react'

import CurrentUserInfoContext from 'contexts/current_user_info'

import cookie from 'scripts/cookie'
import { deleteSignOut } from 'scripts/api'
import validate from 'scripts/validate'

export default () => {
  const currentUserInfoContext = useContext(CurrentUserInfoContext)

  const destroyContexts = () => {
    currentUserInfoContext.setCurrentUserInfo(null)
  }

  const destroyCookies = () => {
    cookie.client.destroyToken()
    cookie.client.destroyUserInfo()
  }

  const signOut = (callback?: () => void): void => {
    const token: Token | null = cookie.client.loadToken()
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
