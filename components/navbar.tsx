import type { NextPage } from 'next'
import React, { useContext } from 'react'

import { CurrentUserInfoContext } from '../pages/_app'

import Link from 'next/link'

const Navbar: NextPage = () => {

  const currentUserInfo = () => {
    const userInfo = useContext(CurrentUserInfoContext)
    if (userInfo) {
      return <p>Welcome { userInfo.name }</p>
    } else {
      return <p>Welcome Guest</p>
    }
  }

  return (
    <nav className='navbar'>
      <div className='container'>
        { currentUserInfo() }
        <Link href="/">
          <a>[HOME]</a>
        </Link>
        <Link href="/signup">
          <a>[SIGNUP]</a>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar