import type { User, AccountStatus } from 'types/global'
import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from './slideout_menu'
import Header from 'components/header'

import AccountContext from 'contexts/account'
import ShowContext from 'contexts/show'

type Props = {
  children: JSX.Element,
}

export default function Layout({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('INITIALIZING')
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)
  const [showSlideoutMenu, setShowSlideoutMenu] = useState<boolean>(false)

  const router = useRouter()
  const { t } = useLocale()

  useEffect(() => {
    window.addEventListener('resize', setMinHeight)
    setMinHeight()
    return (() => removeEventListener('resize', setMinHeight))
  }, [])

  function setMinHeight(): void{
    const wrapElement: HTMLElement | null = document.getElementById('wrap')
    if (wrapElement) wrapElement.style.minHeight = `${window.innerHeight}px`
  }

  function hideAccountMenu(): void{
    if (showAccountMenu) setShowAccountMenu(false)
  }

  return (
    <AccountContext.Provider value={{
      user: currentUser,
      setUser: setCurrentUser,
      status: accountStatus,
      setStatus: setAccountStatus
    }}>
      <ShowContext.Provider value={{
        showAccountMenu: showAccountMenu, setShowAccountMenu: setShowAccountMenu,
        showSlideoutMenu: showSlideoutMenu, setSlideoutMenu: setShowSlideoutMenu
      }}>
        <Head>
          <title>{t.APP_NAME}</title>
          <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
          <meta name="viewport" content="width=device-width,initial-scale=1.0" />
          <link rel="icon" href="/icons/favicon.ico" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`} hrefLang="x-default" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`} hrefLang="en" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}/ja${router.asPath}`} hrefLang="ja" />
        </Head>

        <div id='wrap' onClick={hideAccountMenu}>
          <SlideoutMenu />
          <Header />
          {children}
        </div>
      </ShowContext.Provider>
    </AccountContext.Provider>
  )
}
