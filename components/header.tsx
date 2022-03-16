import type { NextPage } from 'next'
import React, { useContext } from 'react'

import CurrentUserInfoContext from '../contexts/current_user_info'
import ShowAccountMenuContext from '../contexts/show_account_menu'

import Link from 'next/link'
import Image from 'next/image'

const Header: NextPage = () => {
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const showAccountMenuContext = useContext(ShowAccountMenuContext)

  function getAccountComponent(): JSX.Element {
    if (currentUserInfoContext.currentUserInfo) {
      return (
        <div className='header-account-image' onClick={toggleAccountMenu}>
          <Image src={currentUserInfoContext.currentUserInfo.image} width={30} height={30} />
          <ul className={getAccountMenuStyle()}>
            <li onClick={()=> {console.log('Sign Out')}}>Sign Out</li>
          </ul>
        </div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

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

  return (
    <header className='header'>
      <div className='header-menu'>Menu</div>
      <div className='header-home'>
        <Link href="/">HOME</Link>
      </div>
      <div className='header-account'>
        { getAccountComponent() }
      </div>
    </header>
  )
}

export default Header