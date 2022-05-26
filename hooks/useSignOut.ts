import type { Token } from 'types/global'
import { useContext } from 'react'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

export const useSignOut = () => {
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)

  async function fetchSignOut(token: Token) {
    const res = await fetch('http://localhost:3000/api/v1/auth/sign_out', {
      method: 'DELETE',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  const destroyContexts = () => {
    currentTokenContext.setCurrentToken(null)
    currentUserInfoContext.setCurrentUserInfo(null)
  }

  const destroyCookies = () => {
    ClientSideCookies.destroyToken()
    ClientSideCookies.destroyUserInfo()
  }

  const signOut = (callback?: () => void): void => {
    if (validate.token(currentTokenContext.currentToken)) {
      fetchSignOut(currentTokenContext.currentToken).then(json => {
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
