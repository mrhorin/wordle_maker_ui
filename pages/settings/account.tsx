import type { Token } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { useAlert } from 'react-alert'

import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import nprogress from 'nprogress'

import Head from 'next/head'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'
import { ClientSideCookies } from 'scripts/cookie'
import { deleteCurrentUser } from 'scripts/api'

const Account = () => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean | undefined>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])
  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()
  const signOut = useSignOut()

  function handleClickDeleteAccount(): void{
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      setShowOverlay(true)
      nprogress.start()
      deleteCurrentUser(token as Token).then(json => {
        if (json.status == 'success') {
          signOut(() => {
            alert.show(t.ALERT.DELETED, { type: 'success' })
            router.replace('/')
          })
        } else {
          alert.show(t.ALERT.FAILED, { type: 'error' })
          console.error('Error', json)
        }
      }).catch(error => {
        console.log(error)
        setShowOverlay(false)
      }).finally(() => { nprogress.done() })
    } else {
      signOut(() => router.replace('/signup'))
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>{t.SETTINGS.ACCOUNT.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            { t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.SURE }
          </div>
          <div className='modal-window-body'>
            <ol>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.WILL_BE_DELETED }</li>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.CANNOT_RECOVER }</li>
              <li>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.MESSAGE.CANNOT_REPlY }</li>
            </ol>
            <div>
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <label>{ t.FORM.I_AGREE }</label>
          </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' onClick={handleClickDeleteAccount} disabled={!checkedConfirmation}>
              {t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.BUTTON}
            </button>
            <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
          </div>
        </div>
      </Modal>

      <LoadingOverlay showOverlay={showOverlay} />

      <div className='container'>
        <SlideoutMenu />
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'account'} />

          {/* Main */}
          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>{ t.SIDE_MENU.ACCOUNT }</div>
            </div>

            <div className='sp-padding' style={{ marginTop: '1rem' }}>
              <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>{ t.SETTINGS.ACCOUNT.DELETE_ACCOUNT.BUTTON }</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Account
