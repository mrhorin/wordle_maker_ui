import { useEffect, useRef, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad, faPlus, faPenToSquare, faGear, faUser } from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'

type Props = {
  activeMenu?: string
}

const Sidemenu = (props: Props) => {
  const editEl = useRef<HTMLLIElement>(null)
  const createEl = useRef<HTMLLIElement>(null)
  const accountEl = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (props.activeMenu == 'edit') editEl.current?.classList.add('sidemenu-item-active')
    if (props.activeMenu == 'create') createEl.current?.classList.add('sidemenu-item-active')
    if (props.activeMenu == 'account') accountEl.current?.classList.add('sidemenu-item-active')
  }, [])

  return (
    <div id='sidemenu'>
      <div className='sidemenu-items-container'>
        {/* My Games */}
        <ul className='sidemenu-item'>
          <li className='sidemenu-item-title'>
            <FontAwesomeIcon icon={faGamepad} />
            <span className='sidemenu-item-text'>My Games</span>
          </li>
          <li ref={editEl}>
            <Link href="/mygames/edit">
              <a className='sidemenu-item sidemenu-item-mygames-edit'>
                <FontAwesomeIcon icon={faPenToSquare} />
                <span className='sidemenu-item-text'>Edit</span>
              </a>
            </Link>
          </li>
          <li ref={createEl}>
            <Link href="/mygames/create" shallow={true}>
              <a className='sidemenu-item sidemenu-item-mygames-create'>
                <FontAwesomeIcon icon={faPlus} />
                <span className='sidemenu-item-text'>Create</span>
              </a>
            </Link>
          </li>
        </ul>
        {/* Settings */}
        <ul className='sidemenu-item'>
          <li className='sidemenu-item-title'>
            <FontAwesomeIcon icon={faGear} />
            <span className='sidemenu-item-text'>Setteings</span>
          </li>
          <li ref={accountEl}>
            <Link href="/settings/account" shallow={true}>
              <a className='sidemenu-item sidemenu-item-settings-account'>
                <FontAwesomeIcon icon={faUser} />
                <span className='sidemenu-item-text'>Account</span>
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default memo(Sidemenu)
