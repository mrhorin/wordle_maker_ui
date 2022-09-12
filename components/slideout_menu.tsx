import { useRouter } from 'next/router'
import { useContext, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faHome, faSignature } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)
  const router = useRouter()
  const { t } = useLocale()

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
          <li onClick={handleClickHome}>
            <a><FontAwesomeIcon icon={faHome} />{t.SLIDEOUT_MENU.HOME}</a>
          </li>
          <li onClick={handleClickTerms}>
            <a><FontAwesomeIcon icon={faSignature} />{t.SLIDEOUT_MENU.TERMS}</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SlideoutMenu
