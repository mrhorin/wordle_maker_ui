import type { Token } from 'types/global'

import cookie from 'scripts/cookie'
import { deleteSignOut } from 'scripts/api'
import validate from 'scripts/validate'

export default () => {

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
        destroyCookies()
        if (callback) callback()
      })
    } else {
      destroyCookies()
      if (callback) callback()
    }
  }

  return signOut
}
