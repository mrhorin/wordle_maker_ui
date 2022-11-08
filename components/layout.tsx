import type { Theme, Locale, UserInfo } from 'types/global'
import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useLocale from 'hooks/useLocale'

import Header from 'components/header'

import ShowAccountMenuContext from 'contexts/show_account_menu'
import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children: JSX.Element,
}

export default function Layout({ children }: Props) {
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
    <ShowAccountMenuContext.Provider value={{ showAccountMenu, setShowAccountMenu }}>
      <ShowSlideoutMenuContext.Provider value={{ show: showSlideoutMenu, set: setShowSlideoutMenu }}>
        <Head>
          <title>{t.APP_NAME}</title>
          <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
          <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`} hrefLang="x-default" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${router.asPath}`} hrefLang="en" />
          <link rel="alternate" href={`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}/ja${router.asPath}`} hrefLang="ja" />
        </Head>

        <div id='wrap' onClick={hideAccountMenu}>
          <Header />
          {children}
        </div>
      </ShowSlideoutMenuContext.Provider>
    </ShowAccountMenuContext.Provider>
  )
}
