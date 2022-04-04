import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad, faPlus, faPenToSquare, faGear, faUser } from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'

type Props = {
  activeMenu?: string
}

const Sidemenu = (props: Props) => {
  useEffect(() => {
    let activeMenu = document.querySelector(`.sidemenu-menu-${props.activeMenu}`)
    activeMenu?.classList.add('sidemenu-menu-active')
  }, [])

  return (
    <div id='sidemenu'>
      {/* My Games */}
      <ul className='sidemenu-menu'>
        <li className='sidemenu-menu-title'>
          <FontAwesomeIcon icon={faGamepad} />My Games
        </li>
        <li className='sidemenu-menu-create'>
          <Link href="/mygames/create">
            <a className='sidemenu-menu sidemenu-menu-mygames-create'>
              <FontAwesomeIcon icon={faPlus} />Create
            </a>
          </Link>
        </li>
        <li className='sidemenu-menu-edit'>
          <Link href="/mygames/edit">
            <a className='sidemenu-menu sidemenu-menu-mygames-edit'>
              <FontAwesomeIcon icon={faPenToSquare} />Edit
            </a>
          </Link>
        </li>
      </ul>
      {/* Settings */}
      <ul className='sidemenu-menu' style={ {marginTop: '1rem'} }>
        <li className='sidemenu-menu-title'>
          <FontAwesomeIcon icon={faGear} />Setteings
        </li>
        <li className='sidemenu-menu-account'>
          <Link href="/settings/account">
            <a className='sidemenu-menu sidemenu-menu-settings-account'>
              <FontAwesomeIcon icon={faUser} />Account
            </a>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidemenu
