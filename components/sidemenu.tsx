import { useEffect, useRef, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faUser } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'

import Link from 'next/link'

type Props = {
  activeMenu?: string
}

const Sidemenu = (props: Props) => {
  const editEl = useRef<HTMLLIElement>(null)
  const createEl = useRef<HTMLLIElement>(null)
  const accountEl = useRef<HTMLLIElement>(null)
  const { t } = useLocale()

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
            <span className='sidemenu-item-text'>{ t.SIDE_MENU.MY_GAMES }</span>
          </li>
          {/* Create */}
          <li ref={createEl}>
            <Link href="/mygames/create" shallow={true}>
              <div className='sidemenu-item sidemenu-item-mygames-create'>
                <FontAwesomeIcon icon={faPlus} />
                <span className='sidemenu-item-text'>{ t.SIDE_MENU.CREATE }</span>
              </div>
            </Link>
          </li>
          {/* Edit */}
          <li ref={editEl}>
            <Link href="/mygames/edit">
              <div className='sidemenu-item sidemenu-item-mygames-edit'>
                <FontAwesomeIcon icon={faPenToSquare} />
                <span className='sidemenu-item-text'>{ t.SIDE_MENU.EDIT }</span>
              </div>
            </Link>
          </li>
        </ul>
        {/* Settings */}
        <ul className='sidemenu-item'>
          <li className='sidemenu-item-title'>
            <span className='sidemenu-item-text'>{ t.SIDE_MENU.SETTINGS }</span>
          </li>
          {/* Account */}
          <li ref={accountEl}>
            <Link href="/settings/account" shallow={true}>
              <div className='sidemenu-item sidemenu-item-settings-account'>
                <FontAwesomeIcon icon={faUser} />
                <span className='sidemenu-item-text'>{ t.SIDE_MENU.ACCOUNT }</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default memo(Sidemenu)
