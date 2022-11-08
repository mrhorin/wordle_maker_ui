import type { Theme } from 'types/global'
import { useRouter } from 'next/router'
import { ChangeEvent, useContext, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faHome, faSignature, faGlobe, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'
import useTheme from 'hooks/useTheme'

import cookie from 'scripts/cookie'

import ShowContext from 'contexts/show'

import Select from './form/select'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark')
  const showContext = useContext(ShowContext)
  const router = useRouter()
  const { t, setLocale } = useLocale()
  const { getTheme, setTheme } = useTheme()

  useEffect(() => {
    const theme: string | null = getTheme()
    if (theme == 'dark' || theme == 'light' || theme == 'system') {
      setCurrentTheme(theme as Theme)
    }
  }, [])

  function handleClickHome(): void{
    router.push('/')
    showContext.setSlideoutMenu(false)
  }

  function handleClickTerms(): void{
    router.push('/tos')
    showContext.setSlideoutMenu(false)
  }

  function handleChangeTheme(event: ChangeEvent<HTMLSelectElement>): void{
    if (event.target.value == 'system' || event.target.value == 'light' || event.target.value == 'dark') {
      cookie.client.saveTheme(event.target.value)
      setCurrentTheme(event.target.value)
      setTheme(event.target.value)
    }
  }

  function handleChangeLang(event: ChangeEvent<HTMLSelectElement>): void{
    if (event.target.value == 'en' || event.target.value == 'ja') {
      cookie.client.saveLocale(event.target.value)
      setLocale(event.target.value)
    }
  }

  const style = showContext.showSlideoutMenu ? 'slideout-menu slideout-menu-show' : 'slideout-menu'

  return (
    <div className={style}>
      <div className='slideout-menu-overlay' onClick={() => showContext.setSlideoutMenu(false)}></div>
      <div className='slideout-menu-main'>
        <div className='slideout-menu-main-xmark'>
          <FontAwesomeIcon icon={faXmark} onClick={() => showContext.setSlideoutMenu(false)} />
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
                <Select handleChange={handleChangeTheme} defaultValue={'none'}>
                  <option value='none' disabled hidden>{t.SLIDEOUT_MENU.THEME.THEME}</option>
                  <option value='system' defaultValue={currentTheme}>{t.SLIDEOUT_MENU.THEME.SYSTEM}</option>
                  <option value='light' defaultValue={currentTheme}>{t.SLIDEOUT_MENU.THEME.LIGHT}</option>
                  <option value='dark' defaultValue={currentTheme}>{t.SLIDEOUT_MENU.THEME.DARK}</option>
                </Select>
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
                <Select handleChange={handleChangeLang} defaultValue='none'>
                  <option value='none' disabled hidden>{t.SLIDEOUT_MENU.LANGUAGE}</option>
                  <option value='en'>{t.LANG.EN}</option>
                  <option value='ja'>{t.LANG.JA}</option>
                </Select>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SlideoutMenu
