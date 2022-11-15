import type { Token, UserInfo, Query, AccountStatus } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect, useContext, useMemo, memo } from 'react'
import { useAlert } from 'react-alert'
import nprogress from 'nprogress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCaretDown, faEdit, faPlus, faGear, faRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import Modal from 'components/modal'
import Checkbox from './form/checkbox'

import AccountStatusContext from 'contexts/account_status'
import ShowContext from 'contexts/show'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import cookie from 'scripts/cookie'
import validate from 'scripts/validate'
import { getCuurentUser } from 'scripts/api'

import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)

  const accountStatusContext = useContext(AccountStatusContext)
  const showContext = useContext(ShowContext)

  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()
  const signOut = useSignOut()

  useEffect(() => {
    const token: Token | null = getToken()
    if (validate.token(token)) {
      nprogress.start()
      getCuurentUser(token).then(json => {
        alert.removeAll()
        if (json.ok) {
          const userInfo: UserInfo = {
            provider: json.data.provider,
            name: json.data.name,
            nickname: json.data.nickname,
            uid: json.data.uid,
            image: json.data.image,
            isSuspended: json.data.is_suspended,
          }
          cookie.client.saveUserInfo(userInfo)
          setCurrentUser(userInfo)
          if (json.data.is_suspended) {
            accountStatusContext.setAccountStatus('SUSPENDED')
          } else {
            accountStatusContext.setAccountStatus('LOGGEDIN')
          }
        } else {
          alert.show(t.ALERT.FAILED, { type: 'error' })
          accountStatusContext.setAccountStatus('SIGNIN')
        }
      }).catch(error => {
        console.log(error)
        accountStatusContext.setAccountStatus('SIGNIN')
      }).finally(() => {
        nprogress.done()
      })
    } else {
      // Delete current user and token
      cookie.client.destroyToken()
      cookie.client.destroyUserInfo()
      accountStatusContext.setAccountStatus('SIGNIN')
    }
  }, [])

  const handleClickConfirmation = useMemo(() => {
    return () => { setCheckedConfirmation(!checkedConfirmation) }
  }, [checkedConfirmation])

  const handleClickTos = useMemo(() => {
    return () => {
      router.push('/tos')
      setShowModal(false)
    }
  }, [checkedConfirmation])

  function getToken(): Token | null{
    const prevToken: Token | null = cookie.client.loadToken()
    const query: Query = getQuery()
    if (validate.queryToken(query)) {
      const token: Token = {
        accessToken: query['auth_token'],
        client: query['client_id'],
        uid: query['uid'],
        expiry: query['expiry']
      }
      cookie.client.saveToken(token)
      return token
    }
    if (validate.token(prevToken)) return prevToken
    return null
  }

  function getQuery(): Query{
    const url_search: string[] = location.search.slice(1).split('&')
    let key: string[] = []
    let query: Query = {}
    for (let i = 0; i < url_search.length; i++){
      key = url_search[i].split("=")
      query[key[0]] = key[1]
    }
    return query
  }

  function getAccountMenuStyle(): string{
    if (showContext.showAccountMenu) {
      return 'header-account-menu-show'
    } else {
      return 'header-account-menu-hide'
    }
  }

  function toggleAccountMenu(): void{
    if (showContext.showAccountMenu) {
      showContext.setShowAccountMenu(false)
    } else {
      showContext.setShowAccountMenu(true)
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
      accountStatusContext.setAccountStatus('SIGNIN')
      alert.removeAll()
      alert.show(t.ALERT.SIGN_OUT, { type: 'success' })
      router.push('/signin')
    })
  }

  function createHeaderAccountComponent(): JSX.Element {
    if ((accountStatusContext.accountStatus == 'LOGGEDIN' || accountStatusContext.accountStatus == 'SUSPENDED')
      && currentUser) {
      return (
        <div className='header-account-button' onClick={toggleAccountMenu}>
          <div className='header-account-button-image'>
            <Image src={currentUser.image} width={30} height={30} alt={'Avatar'} />
          </div>
          <div className='header-account-button-caretdown'>
            <FontAwesomeIcon icon={faCaretDown} />
          </div>
          <ul className={getAccountMenuStyle()}>
            <li onClick={handleCreateGames}><FontAwesomeIcon icon={faPlus} />{t.HEADER.ACCOUNT.CREATE_A_GAME}</li>
            <li onClick={handleEditGames}><FontAwesomeIcon icon={faEdit} />{t.HEADER.ACCOUNT.EDIT_GAMES}</li>
            <li className='header-account-menu-hide-separater'></li>
            <li onClick={handleAccount}><FontAwesomeIcon icon={faGear} />{t.HEADER.ACCOUNT.ACCOUNT}</li>
            <li className='header-account-menu-hide-separater'></li>
            <li onClick={handleSignOut}><FontAwesomeIcon icon={faRightFromBracket} />{t.HEADER.ACCOUNT.SIGN_OUT}</li>
          </ul>
        </div>
      )
    } else if(accountStatusContext.accountStatus == 'SIGNIN'){
      return (
        <button type='button' className='btn btn-primary' onClick={()=> setShowModal(true)}>{t.HEADER.SIGN_IN}</button>
      )
    } else {
      return <div className='header-account-button'></div>
    }
  }

  return (
    <>
      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          {/* header */}
          <div className='modal-window-header' style={{ position: 'relative' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>{t.SIGN_IN.TITLE}</div>
            <FontAwesomeIcon icon={faXmark} className='xmark' style={{ position: 'absolute', top: '15px', right: '15px' }} onClick={() => setShowModal(false)} />
          </div>
          {/* body */}
          <div className='modal-window-body' style={{ margin: '2rem 0' }}>
            <div className='signin'>
              {/* tos */}
              <div className='signin-tos'>
                {t.SIGN_IN.TOS_TEXT.A}<a onClick={handleClickTos}>{t.TOS.TITLE}</a>{t.SIGN_IN.TOS_TEXT.B}
              </div>
              {/* agreement */}
              <div className='signin-agreement'>
                <Checkbox checked={checkedConfirmation} handleClick={handleClickConfirmation} text={t.SIGN_IN.I_AGREED} />
              </div>
              <div className='signin-btns'>
                {/* Twitter */}
                <form method="post" action={`${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/twitter`}>
                  <button className='btn btn-default btn-signin' style={{ background: '#1e9bf0', color: '#fff', margin: '0 auto', display: 'block' }} disabled={!checkedConfirmation}>
                    <FontAwesomeIcon icon={faTwitter} style={{marginRight: '1rem'}} />
                    {t.SIGN_IN.CONTINUE.TWITTER}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <header className='header'>
        <div className='container'>
          <div className='header-menu'>
            <div className='header-hamburger' onClick={() => showContext.setSlideoutMenu(!showContext.showSlideoutMenu)}>
              <FontAwesomeIcon icon={faBars} className='fa-fw' />
            </div>
          </div>
          <div className='header-home'>
            <Link href="/">
              <a><Image src="/icons/svg/icon.svg" width={23} height={23} alt="HOME" /></a>
            </Link>
          </div>
          <div className='header-account'>
            { createHeaderAccountComponent() }
          </div>
        </div>
      </header>
    </>
  )
}

export default memo(Header)
