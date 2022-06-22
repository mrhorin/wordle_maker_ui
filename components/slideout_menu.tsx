import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faSignature } from '@fortawesome/free-solid-svg-icons'

import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

type Props = {
  children?: JSX.Element
}

const SlideoutMenu = ({ children }: Props) => {
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)

  const style = showSlideoutMenuContext.show ? 'slideout-menu slideout-menu-show' : 'slideout-menu'

  return (
    <div className={style}>
      <div className='slideout-menu-overlay' onClick={() => showSlideoutMenuContext.set(!showSlideoutMenuContext.show)}></div>
      <div className='slideout-menu-main'>
        <div className='slideout-menu-main-xmark'>
          <FontAwesomeIcon icon={faXmark} onClick={() => showSlideoutMenuContext.set(!showSlideoutMenuContext.show)} />
        </div>
        <ul>
          {children}
          <li><FontAwesomeIcon icon={faSignature}/>Terms</li>
        </ul>
      </div>
    </div>
  )
}

export default SlideoutMenu
