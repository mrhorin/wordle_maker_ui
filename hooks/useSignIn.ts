import type { Token, User } from 'types/global'
import { useContext } from 'react'
import { useAlert } from 'react-alert'
import nprogress from 'nprogress'

import cookie from 'scripts/cookie'
import { getCuurentUser } from 'scripts/api'
import validate from 'scripts/validate'

import AccountContext from 'contexts/account'

export default () => {
  /********* Context *********/
  const accountContext = useContext(AccountContext)
  /********** Hook ***********/
  const alert = useAlert()

  const destroyCookies = () => {
    cookie.client.destroyToken()
    cookie.client.destroyUser()
  }

  const signIn = (token: Token, callback?: () => void): void => {
    if (validate.token(token)) {
      nprogress.start()
      getCuurentUser(token).then(json => {
        alert.removeAll()
        if (json.ok) {
          const user: User = {
            provider: json.data.provider,
            name: json.data.name,
            nickname: json.data.nickname,
            uid: json.data.uid,
            image: json.data.image,
            isSuspended: json.data.is_suspended,
          }
          cookie.client.saveUser(user)
          accountContext.setUser(user)
          if (json.data.is_suspended) {
            accountContext.setStatus('SUSPENDED')
          } else {
            accountContext.setStatus('LOGGEDIN')
          }
        } else {
          destroyCookies()
          accountContext.setStatus('SIGNIN')
        }
      }).catch(error => {
        console.log(error)
        destroyCookies()
        accountContext.setStatus('SIGNIN')
      }).finally(() => {
        nprogress.done()
      })
    } else {
      destroyCookies()
      accountContext.setStatus('SIGNIN')
    }
  }

  return signIn
}
