/*
 *  This component should be imported from MygamesEdit component. */
import type { Game } from 'types/global'
import { useEffect, useState, useRef, useContext } from 'react'
import { useAlert } from 'react-alert'
import { useRouter } from 'next/router'

import useSignOut from 'hooks/useSignOut'

import Link from 'next/link'
import nprogress from 'nprogress'

import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'

import LoadingOverlay from 'components/loading_overlay'

import validate from 'scripts/validate'

import CurrentTokenContext from 'contexts/current_token'

interface Props {
  game: Game
  setGame(game: Game): void
}

const Summary = ({ game, setGame }: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*
   * title:
   * desc:
   * challenge_coung:
   *  The states can be changed with input forms. */
  const [title, setTitle] = useState<string>(game.title)
  const [desc, setDesc] = useState<string>(game.desc)
  const [challengeCount, setChallengeCount] = useState<number>(game.challenge_count)
  /* isChanged:
   *  The flag indicates that parameters are changed in the game form or not. */
  const [isChanged, setIsChanged] = useState<boolean>(false)

  /*********** Ref ***********/
  const inputTitleEl = useRef<HTMLInputElement>(null)
  const divTitleInvalidEl = useRef<HTMLDivElement>(null)
  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()

  const signOut = useSignOut()
  const language = useLanguage(game.lang)

  useEffect(() => {
    // When title or desc are changed, the update button is clickable
    if (game.title != title || game.desc != desc || game.challenge_count != challengeCount) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [title, desc, challengeCount, game])

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
            'challenge_count': challengeCount,
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
          .catch(error => console.error(error))
          .finally(() => {
            nprogress.done()
            setShowOverlay(false)
          })
      }
    } else {
      signOut(() => router.replace('/signup'))
    }
  }

  return (
    <div className='mygames-edit-main sp-padding'>
      {/* Gmae Link */}
      <div className='mygames-edit-link'>
        <label>{ t.MY_GAMES.EDIT.SUMMARY.GAME_LINK }</label>
        <Link href={`/games/${game.id}`}>
          <a target="_blank">
            <button className='btn btn-secondary'>
              {`http://localhost:8000/games/${game.id}`}
            </button>
          </a>
        </Link>
      </div>
      {/* Game Form */}
      <form id='game-form' onSubmit={e => e.preventDefault()}>
        {/* Title */}
        <div className='form-group'>
          <label>{ t.GAME.TITLE }</label>
          <div className='form-countable-input-group'>
            <input ref={inputTitleEl} type='text' id='game-title' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
            <div className='form-countable-input-counter'>{`${title.length} / 100`}</div>
          </div>
          <div ref={divTitleInvalidEl} id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Description */}
        <div className='form-group'>
          <label>{ t.GAME.DESC }</label>
          <div className='form-countable-input-group'>
            <textarea id='game-desc' rows={3} maxLength={200} value={desc} onChange={e => setDesc(e.target.value)} />
            <div className='form-countable-input-counter'>{`${desc.length} / 200`}</div>
          </div>
          <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Challenge count */}
        <div className='form-group'>
          <label>{ t.GAME.CHALLENGE_COUNT }</label>
          <select id='game-challengeount' value={challengeCount} onChange={e => setChallengeCount(Number(e.target.value))}>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </select>
        </div>
        {/* Character count */}
        <div className='form-group'>
          <label>{ t.GAME.CHARACTER_COUNT }</label>
          <input type='text' value={game.char_count} disabled={true} />
        </div>
        {/* Language */}
        <div className='form-group'>
          <label>{ t.GAME.LANGUAGE }</label>
          <input type='text' value={language.name} disabled={true} />
        </div>
        {/* Update */}
        <button type='button' id='game-submit' className='btn btn-primary' disabled={!isChanged} onClick={handleClickUpdate}>{ t.FORM.UPDATE }</button>
      </form>
      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default Summary
