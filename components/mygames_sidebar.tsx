import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad, faPlus, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'

type Props = {
  activeMenu?: string
}

const MyGamesSidebar = (props: Props) => {
  useEffect(() => {
    let activeMenu = document.querySelector(`.sidebar-menu-${props.activeMenu}`)
    activeMenu?.classList.add('sidebar-menu-active')
  }, [])

  return (
    <div id='sidebar'>
      <ul id='sidebar-menu'>
        <li className='sidebar-menu-title'>
          <FontAwesomeIcon icon={faGamepad} />My Games
        </li>
        <li className='sidebar-menu-create'>
          <Link href="/mygames/create">
            <a className='sidebar-menu sidebar-menu-mygames-create'>
              <FontAwesomeIcon icon={faPlus} />Create
            </a>
          </Link>
        </li>
        <li className='sidebar-menu-edit'>
          <Link href="/mygames/edit">
            <a className='sidebar-menu sidebar-menu-mygames-edit'>
              <FontAwesomeIcon icon={faPenToSquare} />Edit
            </a>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default MyGamesSidebar
