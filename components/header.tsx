import type { NextPage } from 'next'
import type { Token } from '../types/global'
import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown ,faGamepad, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

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
  const router = useRouter()

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

  function handleMyGames(): void{
    router.replace('/mygames/create')
  }

  function handleSettings(): void{
    router.replace('/settings/account')
  }

  function handleSignOut(): void {
    if (validate.token(currentTokenContext.currentToken)) {
      fetchSignOut(currentTokenContext.currentToken).then(json => {
        if (!json.success) console.error('Error', json)
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        // Delete stored token and user info
        currentTokenContext.setCurrentToken(null)
        currentTokenContext.destroyTokenCookies()
        currentUserInfoContext.setCurrentUserInfo(null)
        currentUserInfoContext.destroyUserInfoCookies()
        router.replace('/signup')
      })
    } else {
      // Delete stored token and user info
      currentTokenContext.setCurrentToken(null)
      currentTokenContext.destroyTokenCookies()
      currentUserInfoContext.setCurrentUserInfo(null)
      currentUserInfoContext.destroyUserInfoCookies()
      router.replace('/signup')
    }
  }

  function headerAccountComponent(): JSX.Element {
    if (validate.userInfo(currentUserInfoContext.currentUserInfo)) {
      return (
        <div className='header-account-image' onClick={toggleAccountMenu}>
          <Image src={currentUserInfoContext.currentUserInfo.image} width={30} height={30} />
          <FontAwesomeIcon icon={faCaretDown} />
          <ul className={getAccountMenuStyle()}>
            <li onClick={handleMyGames}><FontAwesomeIcon icon={faGamepad} />My Games</li>
            <li onClick={handleSettings}><FontAwesomeIcon icon={faGear} />Settings</li>
            <li onClick={handleSignOut}><FontAwesomeIcon icon={faRightFromBracket} />Sign Out</li>
          </ul>
        </div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

  return (
    <header className='header'>
      <div className='container'>
        <div className='header-menu'>Menu</div>
        <div className='header-home'>
          <Link href="/">HOME</Link>
        </div>
        <div className='header-account'>
          { headerAccountComponent() }
        </div>
      </div>
    </header>
  )
}

export default Header