import type { NextPage } from 'next'
import type { Token, UserInfo, Query } from 'types/global'
import React, { useState, useContext, useEffect } from 'react'

import Header from 'components/header'
import Footer from 'components/footer'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'
import ShowAccountMenuContext from 'contexts/show_account_menu'

import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'

const Layout: NextPage = ({ children }) => {
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)

  useEffect(() => {
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
          ClientSideCookies.saveToken(token)
          setCurrentToken(token)
          const userInfo: UserInfo = {
            provider: json.data.provider,
            name: json.data.name,
            nickname: json.data.nickname,
            uid: json.data.uid,
            image: json.data.image
          }
          ClientSideCookies.saveUserInfo(userInfo)
          setCurrentUserInfo(userInfo)
        }
      })
    } else {
      // When query doesn't have a token
      let prevToken: Token | null = ClientSideCookies.loadToken()
      let prevUserInfo: UserInfo | null = ClientSideCookies.loadUserInfo()
      if (validate.token(prevToken) && validate.userInfo(prevUserInfo) && new Date(Number(prevToken.expiry.padEnd(13, '0'))) > new Date()) {
        // Restore user info
        setCurrentToken(prevToken)
        setCurrentUserInfo(prevUserInfo)
      } else {
        // Delete stored token and user info
        ClientSideCookies.destroyToken()
        ClientSideCookies.destroyUserInfo()
        setCurrentToken(null)
        setCurrentUserInfo(null)
      }
    }
  }, [])

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

  function hideAccountMenu(): void{
    if (showAccountMenu) setShowAccountMenu(false)
  }

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

  return (
    <CurrentTokenContext.Provider value={{ currentToken, setCurrentToken }}>
      <CurrentUserInfoContext.Provider value={{ currentUserInfo, setCurrentUserInfo }}>
        <ShowAccountMenuContext.Provider value={{ showAccountMenu, setShowAccountMenu }}>
          <div className='wrap' onClick={hideAccountMenu}>
            <Header />
            {children}
          </div>
        </ShowAccountMenuContext.Provider>
      </CurrentUserInfoContext.Provider>
    </CurrentTokenContext.Provider>
  )
}

export default Layout