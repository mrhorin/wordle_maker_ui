import type { NextPage } from 'next'
import type { Token } from '../types/global'
import React, { useContext } from 'react'
import { destroyCookie } from 'nookies'

import CurrentTokenContext from '../contexts/current_token'
import CurrentUserInfoContext from '../contexts/current_user_info'
import ShowAccountMenuContext from '../contexts/show_account_menu'

import validate from '../validate'

import Link from 'next/link'
import Image from 'next/image'

const Header: NextPage = () => {
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const showAccountMenuContext = useContext(ShowAccountMenuContext)

  function getAccountMenuStyle(): string{
    if (showAccountMenuContext.showAccountMenu) {
      return 'header-account-menu-show'
    } else {
      return 'header-account-menu-hide'
    }
  }

  function toggleAccountMenu(): void{
    if (showAccountMenuContext.showAccountMenu) {
      showAccountMenuContext.setShowAccountMenu(false)
    } else {
      showAccountMenuContext.setShowAccountMenu(true)
    }
  }

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

  function handleSignOut(): void {
    if (validate.token(currentTokenContext.currentToken)) {
      fetchSignOut(currentTokenContext.currentToken).then(json => {
        if (!json.success) console.error('Error', json)
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        // Delete stored token and user info
        destroyCookie(null, 'token')
        destroyCookie(null, 'userInfo')
        currentTokenContext.setCurrentToken(null)
        currentUserInfoContext.setCurrentUserInfo(null)
      })
    } else {
      // Delete stored token and user info
      destroyCookie(null, 'token')
      destroyCookie(null, 'userInfo')
      currentTokenContext.setCurrentToken(null)
      currentUserInfoContext.setCurrentUserInfo(null)
    }
  }

  function accountComponent(): JSX.Element {
    if (currentUserInfoContext.currentUserInfo) {
      return (
        <div className='header-account-image' onClick={toggleAccountMenu}>
          <Image src={currentUserInfoContext.currentUserInfo.image} width={30} height={30} />
          <ul className={getAccountMenuStyle()}>
            <li onClick={handleSignOut}>Sign Out</li>
          </ul>
        </div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

  return (
    <header className='header'>
      <div className='header-menu'>Menu</div>
      <div className='header-home'>
        <Link href="/">HOME</Link>
      </div>
      <div className='header-account'>
        { accountComponent() }
      </div>
    </header>
  )
}

export default Header