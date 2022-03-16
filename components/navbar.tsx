import type { NextPage } from 'next'
import React, { useContext } from 'react'

import { CurrentUserInfoContext } from '../pages/_app'

import Link from 'next/link'

const Navbar: NextPage = () => {

  const currentUserInfo = () => {
    const userInfo = useContext(CurrentUserInfoContext)
    if (userInfo) {
      return (
        <div>{ userInfo.name }</div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

  return (
    <nav className='header-navbar'>
      { currentUserInfo() }
    </nav>
  )
}

export default Navbar