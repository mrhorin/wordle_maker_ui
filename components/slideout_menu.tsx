import { useContext, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faSignature } from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)

  useLayoutEffect(() => {
    showSlideoutMenuContext.set(false)
  }, [])

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
          <li>
            <Link href="/tos"><a>
              <FontAwesomeIcon icon={faSignature} />Terms
            </a></Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SlideoutMenu
