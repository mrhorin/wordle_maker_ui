import type { Token } from 'types/global'
import { useContext } from 'react'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'

import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

export default () => {
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)

  async function fetchSignOut(token: Token) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/sign_out`, {
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
      fetchSignOut(currentTokenContext.currentToken as Token).then(json => {
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
