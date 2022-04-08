import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad, faPlus, faPenToSquare, faGear, faUser } from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'

type Props = {
  activeMenu?: string
}

const Sidemenu = (props: Props) => {
  useEffect(() => {
    let activeMenu = document.querySelector(`.sidemenu-item-${props.activeMenu}`)
    activeMenu?.classList.add('sidemenu-item-active')
  }, [])

  return (
    <div id='sidemenu'>
      <div className='sidemenu-items-container'>
        {/* My Games */}
        <ul className='sidemenu-item'>
          <li className='sidemenu-item-title'>
            <FontAwesomeIcon icon={faGamepad} />My Games
          </li>
          <li className='sidemenu-item-edit'>
            <Link href="/mygames/edit">
              <a className='sidemenu-item sidemenu-item-mygames-edit'>
                <FontAwesomeIcon icon={faPenToSquare} />Edit
              </a>
            </Link>
          </li>
          <li className='sidemenu-item-create'>
            <Link href="/mygames/create">
              <a className='sidemenu-item sidemenu-item-mygames-create'>
                <FontAwesomeIcon icon={faPlus} />Create
              </a>
            </Link>
          </li>
        </ul>
        {/* Settings */}
        <ul className='sidemenu-item' style={ {marginTop: '1rem'} }>
          <li className='sidemenu-item-title'>
            <FontAwesomeIcon icon={faGear} />Setteings
          </li>
          <li className='sidemenu-item-account'>
            <Link href="/settings/account">
              <a className='sidemenu-item sidemenu-item-settings-account'>
                <FontAwesomeIcon icon={faUser} />Account
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidemenu
