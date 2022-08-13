import type { Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useContext, useMemo } from 'react'
import useLocale from 'hooks/useLocale'
import nprogress from 'nprogress'
import { useAlert } from 'react-alert'

import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import CurrentTokenContext from 'contexts/current_token'

import validate from 'scripts/validate'

interface Props {
  game: Game
}

const Settings = ({ game }: Props) => {
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

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)
  /*********** Memo ***********/
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()

  function handleClickDelete(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      setShowOverlay(true)
      nprogress.start()
      fetch(`http://localhost:3000/api/v1/games/${game.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          'access-token': currentTokenContext.currentToken.accessToken,
          'client': currentTokenContext.currentToken.client,
          'uid': currentTokenContext.currentToken.uid
        }
      }).then(res => res.json())
        .then(json => {
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
    }
  }

  return (
    <div className='mygames-edit-main sp-padding' style={{ marginTop: '1rem' }}>
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
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <span style={{ fontWeight: '500' }}>{ t.FORM.I_AGREE }</span>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>{ t.COMMON.DELETE }</button>
            <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
          </div>
        </div>
      </Modal>
      {/* LoadingOverlay */}
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default Settings