import { useRouter } from 'next/router'
import { ChangeEvent, useContext, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faHome, faSignature, faGlobe } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'

import cookie from 'scripts/cookie'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)
  const router = useRouter()
  const { t, switchLocale } = useLocale()

  useLayoutEffect(() => {
    showSlideoutMenuContext.set(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClickHome(): void{
    router.push('/')
    showSlideoutMenuContext.set(false)
  }

  function handleClickTerms(): void{
    router.push('/tos')
    showSlideoutMenuContext.set(false)
  }

  function handleChangeLang(event: ChangeEvent<HTMLSelectElement>): void{
    if (event.target.value == 'en' || event.target.value == 'ja') {
      cookie.client.saveLocale(event.target.value)
      switchLocale(event.target.value)
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
