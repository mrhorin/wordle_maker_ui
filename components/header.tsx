import type { NextPage } from 'next'
import React, { useContext } from 'react'

import { CurrentUserInfoContext } from '../pages/_app'

import Link from 'next/link'
import Image from 'next/image'

const Header: NextPage = () => {
  const currentUserInfo = () => {
    const userInfo = useContext(CurrentUserInfoContext)
    if (userInfo) {
      return (
        <div className='header-navbar-account'>
          <div className='header-navbar-account-image'>
            <Image src={userInfo.image} width={30} height={30} />
          </div>
        </div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

  return (
    <header className='header'>
      <div className='header-home'>
        <Link href="/">HOME</Link>
      </div>
      <nav className='header-navbar'>
        { currentUserInfo() }
      </nav>
    </header>
  )
}

export default Header