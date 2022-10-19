import type { Game, Token } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import nprogress from 'nprogress'
import { useAlert } from 'react-alert'

import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import cookie from 'scripts/cookie'
import { deleteGame } from 'scripts/api'
import validate from 'scripts/validate'

interface Props {
  game: Game
}

const DeleteGame = ({ game }: Props) => {
  /*
   * checkedConfirmation:
   *  The flag indicates whether an user agreed to delete the game or not. */
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  /* shoModal:
   *  The flag indicates whether a modal window to confirm deleting the game is shown or not. */
  const [showModal, setShowModal] = useState<boolean>(false)
  /* showOverLay:
   *  The flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)

  /*********** Memo ***********/
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()
  const alert = useAlert()

  function handleClickDelete(): void{
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      setShowOverlay(true)
      nprogress.start()
      deleteGame(token, game).then(json => {
        alert.removeAll()
        if (json.ok) {
          alert.show(t.ALERT.DELETED, {type: 'success'})
          router.replace('/mygames/edit')
        } else {
          alert.show(t.ALERT.FAILED, {type: 'error'})
          console.error(json.message)
        }
      })
      .catch(error => {
        console.log(error)
        setShowOverlay(false)
      })
      .finally(() => { nprogress.done() })
    } else {
      signOut(() => router.replace('/signin'))
    }
  }

  return (
    <>
      <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>{ t.MY_GAMES.EDIT.DELETE_GAME.BUTTON }</button>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            { t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.SURE }
          </div>
          <div className='modal-window-body'>
            <ol>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.WILL_BE_DELETED }</li>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.CANNOT_RECOVER }</li>
              <li>{ t.MY_GAMES.EDIT.DELETE_GAME.MESSAGE.CANNOT_REPlY }</li>
            </ol>
            <div className='agreement' onClick={handleConfirmation}>
              <input className='checkbox-default agreement-checkbox' type="checkbox" id="confirmation" checked={checkedConfirmation} />
              <span className='agreement-text' style={{ fontWeight: '500', cursor: 'default' }}>{ t.FORM.I_AGREE }</span>
            </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>{ t.COMMON.DELETE }</button>
            <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
          </div>
        </div>
      </Modal>
      {/* LoadingOverlay */}
      <LoadingOverlay showOverlay={showOverlay} />
    </>
  )
}

export default DeleteGame