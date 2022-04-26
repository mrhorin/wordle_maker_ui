/*
 *  This component should be imported from MygamesEdit component. */
import type { Game } from 'types/global'
import { useEffect, useState, useRef, useContext } from 'react'
import { useAlert } from 'react-alert'
import Link from 'next/link'
import nprogress from 'nprogress'

import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'
import Language from 'scripts/language'

import CurrentTokenContext from 'contexts/current_token'

interface Props {
  game: Game
  setGame(game: Game): void
  signOut(): void
}

const Summary = ({ game, setGame,signOut }: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*
   * title:
   * desc:
   *  The states can be changed with input forms. */
  const [title, setTitle] = useState<string>(game.title)
  const [desc, setDesc] = useState<string>(game.desc)
  /* isChanged:
   *  The flag indicates that parameters are changed in the game form or not. */
  const [isChanged, setIsChanged] = useState<boolean>(false)

  /*********** Ref ***********/
  const inputTitleEl = useRef<HTMLInputElement>(null)
  const divTitleInvalidEl = useRef<HTMLDivElement>(null)
  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

  const alert = useAlert()
  const language = new Language(game.lang)

  useEffect(() => {
    // When title or desc are changed, the update button is clickable
    if (game.title != title || game.desc != desc) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [title, desc, game])

  function validateTitle(): boolean{
    const titleLength: number = Number(title.length)
    if (titleLength < 1) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '* Title is required.'
      return false
    } else if (titleLength > 100) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '* Title must be 100 characters or less.'
      return false
    } else {
      inputTitleEl.current?.classList.remove('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = ''
      return true
    }
  }

  function handleClickUpdate(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const body = {
          game: {
            'id': game.id,
            'title': title,
            'desc': desc,
          }
        }
        setShowOverlay(true)
        nprogress.start()
        fetch(`http://localhost:3000/api/v1/games/${game.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              alert.show('UPDATED', { type: 'success' })
              setGame(json.data as Game)
            } else {
              console.error(json)
              alert.show('FAILED', {type: 'error'})
            }
          })
          .catch(error => console.log(error))
          .finally(() => {
            nprogress.done()
            setShowOverlay(false)
          })
      }
    } else {
      signOut()
    }
  }

  return (
    <div className='game-edit-summary'>
      <form id='game-form' onSubmit={e => e.preventDefault()}>
        {/* Gmae Link */}
        <div className='game-edit-link'>
          <label>Game Link</label>
          <Link href={`/games/${game.id}`}>
            <a>
              <button className='btn btn-secondary'>
                {`http://localhost:8000/games/${game.id}`}
              </button>
            </a>
          </Link>
        </div>
        {/* Title */}
        <div className='form-group'>
          <label>Title</label>
          <div className='form-countable-input-group'>
            <input ref={inputTitleEl} type='text' id='game-title' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
            <div className='form-countable-input-counter'>{`${title.length} / 100`}</div>
          </div>
          <div ref={divTitleInvalidEl} id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Description */}
        <div className='form-group'>
          <label>Description</label>
          <div className='form-countable-input-group'>
            <textarea id='game-desc' rows={3} maxLength={200} value={desc} onChange={e => setDesc(e.target.value)} />
            <div className='form-countable-input-counter'>{`${desc.length} / 200`}</div>
          </div>
          <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Language */}
        <div className='form-group'>
          <label>Language</label>
          <input type='text' value={language.name} disabled={true} />
        </div>
        {/* Character count */}
        <div className='form-group'>
          <label>Character count</label>
          <input type='text' value={game.char_count} disabled={true} />
        </div>
        {/* Submit */}
        <button type='button' id='game-submit' className='btn btn-primary' disabled={!isChanged} onClick={handleClickUpdate}>Update</button>
      </form>
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default Summary
