import type { AppProps } from 'next/app'
import type { UserInfo, Token, Query } from '../types/global'
import { useState, useLayoutEffect } from 'react'

import CurrentTokenContext from '../contexts/current_token'
import CurrentUserInfoContext from '../contexts/current_user_info'
import ShowAccountMenuContext from '../contexts/show_account_menu'

import validate from '../validate'

import Layout from '../components/layout'
import '../styles/globals.scss'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)

  useLayoutEffect(() => {
    const query: Query = getQuery()
    if (validate.queryToken(query)) {
      // When query has a token, fetch user info with the token
      const token: Token = {
        accessToken: query['auth_token'],
        client: query['client_id'],
        uid: query['uid'],
        expiry: query['expiry']
      }
      fetchCurrentUser(token).then(json => {
        if (json && json.isLoggedIn) {
          saveToken(token)
          setCurrentToken(token)
          const userInfo: UserInfo = {
            provider: json.data.provider,
            name: json.data.name,
            nickname: json.data.nickname,
            uid: json.data.uid,
            image: json.data.image
          }
          saveUserInfo(userInfo)
          setCurrentUserInfo(userInfo)
        }
      })
    } else {
      // When query doesn't have a token
      let prevToken: Token | null = loadToken()
      let prevUserInfo: UserInfo | null = loadUserInfo()
      if (prevToken && prevUserInfo) {
        // Restore user info
        setCurrentToken(prevToken)
        setCurrentUserInfo(prevUserInfo)
      } else {
        // Delete stored token and user info
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        setCurrentToken(null)
        setCurrentUserInfo(null)
      }
    }
  }, [])

  return (
    <CurrentTokenContext.Provider value={{ currentToken, setCurrentToken }}>
      <CurrentUserInfoContext.Provider value={{ currentUserInfo, setCurrentUserInfo }}>
        <ShowAccountMenuContext.Provider value={{ showAccountMenu, setShowAccountMenu }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ShowAccountMenuContext.Provider>
      </CurrentUserInfoContext.Provider>
    </CurrentTokenContext.Provider>
  )
}

/*-----------------------------------------
  functions
-----------------------------------------*/
async function fetchCurrentUser(token: Token) {
  const res = await fetch('http://localhost:3000/api/v1/users/current', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'access-token': token.accessToken,
      'client': token.client,
      'uid': token.uid
    }
  })
  return await res.json()
}

function saveUserInfo(userInfo: UserInfo): void{
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

function loadUserInfo(): UserInfo | null{
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (validate.userInfo(userInfo)) {
    return userInfo as UserInfo
  } else {
    return null
  }
}

function saveToken(token: Token): void {
  localStorage.setItem('token', JSON.stringify(token))
}

function loadToken(): Token | null{
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  if (validate.token(token)) {
    return token as Token
  } else {
    return null
  }
}

function getQuery(): Query{
  const url_search: string[] = location.search.slice(1).split('&')
	let key: string[] = []
  let query: Query = {}
  for (let i = 0; i < url_search.length; i++){
		key = url_search[i].split("=")
		query[key[0]] = key[1]
  }
  return query
}
