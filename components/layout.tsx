import type { UserInfo } from 'types/global'
import React, { useState } from 'react'

import Header from 'components/header'

import CurrentUserInfoContext from 'contexts/current_user_info'
import ShowAccountMenuContext from 'contexts/show_account_menu'
import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children: JSX.Element,
}

export default function Layout({ children }: Props) {
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)
  const [showSlideoutMenu, setShowSlideoutMenu] = useState<boolean>(false)

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
