import type { NextPage } from 'next'
import React, { useContext } from 'react'

import ShowAccountMenuContext from 'contexts/show_account_menu'

import Header from 'components/header'
import Footer from 'components/footer'

const Layout: NextPage = ({ children }) => {
  const showAccountMenuContext = useContext(ShowAccountMenuContext)

  function hideAccountMenu(): void{
    if (showAccountMenuContext.showAccountMenu) {
      showAccountMenuContext.setShowAccountMenu(false)
    }
  }

  return (
    <div className='wrap' onClick={hideAccountMenu}>
      <Header />
        {children}
      <Footer />
    </div>
  )

}

export default Layout