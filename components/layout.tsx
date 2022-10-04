import type { Token, UserInfo, Query } from 'types/global'
import React, { useState, useEffect } from 'react'

import Header from 'components/header'

import CurrentUserInfoContext from 'contexts/current_user_info'
import ShowAccountMenuContext from 'contexts/show_account_menu'
import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'
import { getCuurentUser } from 'scripts/api'

type Props = {
  children: JSX.Element,
}

export default function Layout({ children }: Props) {
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)
  const [showSlideoutMenu, setShowSlideoutMenu] = useState<boolean>(false)

  useEffect(() => {
    const prevToken: Token | null = ClientSideCookies.loadToken()
    const prevUserInfo: UserInfo | null = ClientSideCookies.loadUserInfo()
    const query: Query = getQuery()
    if (validate.token(prevToken) && validate.userInfo(prevUserInfo)) {
      // Restore current user
      setCurrentUserInfo(prevUserInfo)
    } else if (validate.queryToken(query)) {
      // Get current user info with the token
      const token: Token = {
        accessToken: query['auth_token'],
        client: query['client_id'],
        uid: query['uid'],
        expiry: query['expiry']
      }
      ClientSideCookies.saveToken(token)
      getCuurentUser(token).then(json => {
        if (json && json.isLoggedIn) {
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
      // Delete current user and token
      ClientSideCookies.destroyToken()
      ClientSideCookies.destroyUserInfo()
      setCurrentUserInfo(null)
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

  return (
    <CurrentUserInfoContext.Provider value={{ currentUserInfo, setCurrentUserInfo }}>
      <ShowAccountMenuContext.Provider value={{ showAccountMenu, setShowAccountMenu }}>
        <ShowSlideoutMenuContext.Provider value={{ show: showSlideoutMenu, set: setShowSlideoutMenu }}>
          <div className='wrap' onClick={hideAccountMenu}>
            <Header />
            {children}
          </div>
        </ShowSlideoutMenuContext.Provider>
      </ShowAccountMenuContext.Provider>
    </CurrentUserInfoContext.Provider>
  )
}
