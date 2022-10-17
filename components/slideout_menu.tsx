import type { Theme } from 'types/global'
import { useRouter } from 'next/router'
import { ChangeEvent, useContext, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faHome, faSignature, faGlobe, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'

import cookie from 'scripts/cookie'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'
import useTheme from 'hooks/useTheme'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)
  const router = useRouter()
  const { t, setLocale } = useLocale()
  const { getSystemTheme, setTheme } = useTheme()

  function handleClickHome(): void{
    router.push('/')
    showSlideoutMenuContext.set(false)
  }

  function handleClickTerms(): void{
    router.push('/tos')
    showSlideoutMenuContext.set(false)
  }

  function handleOnChangeTheme(event: ChangeEvent<HTMLSelectElement>): void{
    if (event.target.value == 'system' || event.target.value == 'light' || event.target.value == 'dark') {
      cookie.client.saveTheme(event.target.value)
      setTheme(event.target.value)
    }
    showSlideoutMenuContext.set(false)
  }

  function handleChangeLang(event: ChangeEvent<HTMLSelectElement>): void{
    if (event.target.value == 'en' || event.target.value == 'ja') {
      cookie.client.saveLocale(event.target.value)
      setLocale(event.target.value)
    }
    showSlideoutMenuContext.set(false)
  }

  const style = showSlideoutMenuContext.show ? 'slideout-menu slideout-menu-show' : 'slideout-menu'

  return (
    <div className={style}>
      <div className='slideout-menu-overlay' onClick={() => showSlideoutMenuContext.set(false)}></div>
      <div className='slideout-menu-main'>
        <div className='slideout-menu-main-xmark'>
          <FontAwesomeIcon icon={faXmark} onClick={() => showSlideoutMenuContext.set(false)} />
        </div>
        <ul>
          {children}
          {/* Home */}
          <li onClick={handleClickHome}>
            <a className='slideout-menu-main-item'>
              <div className='slideout-menu-main-item-icon'>
                <FontAwesomeIcon icon={faHome} />
              </div>
              <div className='slideout-menu-main-item-text'>
                {t.SLIDEOUT_MENU.HOME}
              </div>
            </a>
          </li>
          {/* TOS */}
          <li onClick={handleClickTerms}>
            <a className='slideout-menu-main-item'>
              <div className='slideout-menu-main-item-icon'>
                <FontAwesomeIcon icon={faSignature} />
              </div>
              <div className='slideout-menu-main-item-text'>
                {t.SLIDEOUT_MENU.TERMS}
              </div>
            </a>
          </li>
          {/* Theme */}
          <li>
            <div className='slideout-menu-main-item'>
              <div className='slideout-menu-main-item-icon'>
                <FontAwesomeIcon icon={faCircleHalfStroke} />
              </div>
              <div className='slideout-menu-main-item-text'>
                <select onChange={e => handleOnChangeTheme(e)} defaultValue='none'>
                  <option value='none' disabled hidden>{t.SLIDEOUT_MENU.THEME.THEME}</option>
                  <option value='system'>{t.SLIDEOUT_MENU.THEME.SYSTEM}</option>
                  <option value='light'>{t.SLIDEOUT_MENU.THEME.LIGHT}</option>
                  <option value='dark'>{t.SLIDEOUT_MENU.THEME.DARK}</option>
                </select>
              </div>
            </div>
          </li>
          {/* Language */}
          <li>
            <div className='slideout-menu-main-item'>
              <div className='slideout-menu-main-item-icon'>
                <FontAwesomeIcon icon={faGlobe} />
              </div>
              <div className='slideout-menu-main-item-text'>
                <select onChange={e => handleChangeLang(e)} defaultValue='none'>
                  <option value='none' disabled hidden>{t.SLIDEOUT_MENU.LANGUAGE}</option>
                  <option value='en'>{t.LANG.EN}</option>
                  <option value='ja'>{t.LANG.JA}</option>
                </select>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SlideoutMenu
