import { useRouter } from 'next/router'
import { useContext, memo } from 'react'
import { useAlert } from 'react-alert'
import useSignOut from 'hooks/useSignOut'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCaretDown, faGamepad, faPlus, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import CurrentUserInfoContext from 'contexts/current_user_info'
import ShowAccountMenuContext from 'contexts/show_account_menu'
import ShowSlideoutMenuContext from 'contexts/show_slideout_menu'

import validate from 'scripts/validate'

import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  const showAccountMenuContext = useContext(ShowAccountMenuContext)
  const showSlideoutMenuContext = useContext(ShowSlideoutMenuContext)
  const router = useRouter()
  const alert = useAlert()
  const signOut = useSignOut()

  function getAccountMenuStyle(): string{
    if (showAccountMenuContext.showAccountMenu) {
      return 'header-account-menu-show'
    } else {
      return 'header-account-menu-hide'
    }
  }

  function toggleAccountMenu(): void{
    if (showAccountMenuContext.showAccountMenu) {
      showAccountMenuContext.setShowAccountMenu(false)
    } else {
      showAccountMenuContext.setShowAccountMenu(true)
    }
  }

  function handleEditGames(): void{
    router.push('/mygames/edit')
  }

  function handleCreateGames(): void{
    router.push('/mygames/create')
  }

  function handleAccount(): void{
    router.push('/settings/account')
  }

  function handleSignOut(): void {
    signOut(() => {
      alert.show('SIGNED OUT', {type: 'success'})
      router.push('/signup')
    })
  }

  function createHeaderAccountComponent(): JSX.Element {
    if (validate.userInfo(currentUserInfoContext.currentUserInfo)) {
      return (
        <div className='header-account-image' onClick={toggleAccountMenu}>
          <Image src={currentUserInfoContext.currentUserInfo.image} width={30} height={30} />
          <FontAwesomeIcon icon={faCaretDown} />
          <ul className={getAccountMenuStyle()}>
            <li onClick={handleEditGames}><FontAwesomeIcon icon={faGamepad} />Edit Games</li>
            <li onClick={handleCreateGames}><FontAwesomeIcon icon={faPlus} />Create Games</li>
            <li className='header-account-menu-hide-separater'></li>
            <li onClick={handleAccount}><FontAwesomeIcon icon={faGear} />Account</li>
            <li className='header-account-menu-hide-separater'></li>
            <li onClick={handleSignOut}><FontAwesomeIcon icon={faRightFromBracket} />Sign Out</li>
          </ul>
        </div>
      )
    } else {
      return <Link href="/signup"><a>Sign Up</a></Link>
    }
  }

  return (
    <header className='header'>
      <div className='container'>
        <div className='header-menu'>
          <div className='header-menu-icon' onClick={() => showSlideoutMenuContext.set(!showSlideoutMenuContext.show)}>
            <FontAwesomeIcon icon={faBars} />
          </div>
        </div>
        <div className='header-home'>
          <Link href="/">HOME</Link>
        </div>
        <div className='header-account'>
          { createHeaderAccountComponent() }
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
