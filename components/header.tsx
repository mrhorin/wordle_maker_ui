import type { Token, User, Query } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useEffect, useContext, useMemo, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faBars, faCaretDown, faEdit, faPlus, faGear, faRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import Modal from 'components/modal'
import Checkbox from 'components/form/checkbox'

import AccountContext from 'contexts/account'
import ShowContext from 'contexts/show'

import useSignIn from 'hooks/useSignIn'
import useSignOut from 'hooks/useSignOut'
import useOauth from 'hooks/useOauth'
import useLocale from 'hooks/useLocale'
import useToastify from 'hooks/useToastify'

import cookie from 'scripts/cookie'
import validate from 'scripts/validate'

import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  /********** State **********/
  const [showModal, setShowModal] = useState<boolean>(false)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  /********* Context *********/
  const accountContext = useContext(AccountContext)
  const showContext = useContext(ShowContext)
  /********** Hook ***********/
  const router = useRouter()
  const signIn = useSignIn()
  const signOut = useSignOut()
  const oauth = useOauth()
  const toastify = useToastify()
  const { t } = useLocale()

  useEffect(() => {
    const token: Token | null = getToken()
    validate.token(token) ? signIn(token) : accountContext.setStatus('SIGNIN')
  }, [])

  const handleClickConfirmation = useMemo(() => {
    return () => { setCheckedConfirmation(!checkedConfirmation) }
  }, [checkedConfirmation])

  const handleClickTos = useMemo(() => {
    return () => {
      setShowModal(false)
    }
  }, [checkedConfirmation])

  function getToken(): Token | null{
    const prevToken: Token | null = cookie.client.loadToken()
    if (validate.token(prevToken)) return prevToken
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
      accountContext.setStatus('SIGNIN')
      toastify.alertSuccess(t.ALERT.SIGN_OUT)
      router.push('/signin')
    })
  }

  function createHeaderAccountComponent(): JSX.Element {
    if ((accountContext.status == 'LOGGEDIN' || accountContext.status == 'SUSPENDED')
      && accountContext.user) {
      return (
        <div className='header-account-button' onClick={toggleAccountMenu}>
          <div className='header-account-button-image'>
            <Image src={accountContext.user.image} width={30} height={30} alt={'Avatar'} />
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
    } else if(accountContext.status == 'SIGNIN'){
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
                {t.SIGN_IN.TOS_TEXT.A}
                <Link href="/tos" onClick={handleClickTos}>{t.TOS.TITLE}</Link>
                {t.SIGN_IN.TOS_TEXT.B}
              </div>
              {/* agreement */}
              <div className='signin-agreement'>
                <Checkbox checked={checkedConfirmation} handleClick={handleClickConfirmation} text={t.SIGN_IN.I_AGREED} />
              </div>
              <div className='signin-btns'>
                {/* Twitter */}
                <button className='btn btn-signin-tw' disabled={!checkedConfirmation} onClick={() => oauth.twitter()}>
                  <FontAwesomeIcon icon={faTwitter} />
                  {t.SIGN_IN.CONTINUE.TWITTER}
                </button>
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
              <div><Image src="/icons/svg/icon.svg" width={23} height={23} alt="HOME" /></div>
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
