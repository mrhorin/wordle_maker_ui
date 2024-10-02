/*
 *  This component should be imported from MygamesEdit component. */
import type { Game, Token } from 'types/global'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-regular-svg-icons'

import useSignOut from 'hooks/useSignOut'

import Link from 'next/link'
import nprogress from 'nprogress'

import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'
import useCopyToClipboard from 'hooks/useCopyToClipboard'
import useToastify from 'hooks/useToastify'

import LoadingOverlay from 'components/loading_overlay'
import Checkbox from 'components/form/checkbox'

import validate from 'scripts/validate'
import { putGame } from 'scripts/api'
import cookie from 'scripts/cookie'
import Select from 'components/form/select'

interface Props {
  game: Game
  setGame(game: Game): void
}

const Settings = ({ game, setGame }: Props) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*
   * title:
   * desc:
   * challenge_coung:
   *  The states can be changed with input forms. */
  const [title, setTitle] = useState<string>(game.title)
  const [desc, setDesc] = useState<string>(game.desc)
  const [challengeCount, setChallengeCount] = useState<number>(game.challenge_count)
  const [isPublished, setIsPublished] = useState<boolean>(game.is_published)
  /* isChanged:
   *  The flag indicates that parameters are changed in the game form or not. */
  const [isChanged, setIsChanged] = useState<boolean>(false)

  /*********** Ref ***********/
  const inputTitleEl = useRef<HTMLInputElement>(null)
  const divTitleInvalidEl = useRef<HTMLDivElement>(null)

  /********** Hook ***********/
  const router = useRouter()
  const { t, locale } = useLocale()
  const toastify = useToastify()

  const signOut = useSignOut()
  const language = useLanguage(game.lang)
  const [clipboard, copy] = useCopyToClipboard()

  useEffect(() => {
    // When title or desc are changed, the update button is clickable
    if (game.title != title || game.desc != desc || game.challenge_count != challengeCount || game.is_published != isPublished) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [title, desc, challengeCount, isPublished, game])

  function validateTitle(): boolean{
    const titleLength: number = Number(title.length)
    if (titleLength < 1) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '* ' + t.VALIDATE.GAME.TITLE.REQUIRED
      return false
    } else if (titleLength > 100) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '* ' + t.VALIDATE.GAME.TITLE.CHARS_OR_LESS
      return false
    } else {
      inputTitleEl.current?.classList.remove('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = ''
      return true
    }
  }

  function handleClickVisibility(): void {
    setIsPublished(!isPublished)
  }

  function handleChangeChallengeCount(event: React.ChangeEvent<HTMLSelectElement>): void{
    setChallengeCount(Number(event.target.value))
  }

  function handleClickUpdate(): void{
    const token: Token | null = cookie.client.loadToken()
    if (validateTitle()) {
      if (validate.token(token)) {
        setShowOverlay(true)
        nprogress.start()
        const nextGame: Game = {
          id: game.id,
          title: title,
          desc: desc,
          challenge_count: challengeCount,
          lang: game.lang,
          char_count: game.char_count,
          is_published: isPublished,
        }
        putGame(token, nextGame).then(json => {
          if (json.ok) {
            setGame(json.data as Game)
            toastify.alertSuccess(t.ALERT.UPDATED)
          } else {
            console.error(json)
            toastify.alertError(t.ALERT.FAILED)
          }
        }).catch(error => console.error(error)).finally(() => {
          nprogress.done()
          setShowOverlay(false)
        })
      } else {
        signOut(() => router.replace('/signin'))
      }
    }
  }

  function handleClickCopy(): void{
    const localePath = !locale || locale == 'en' ? '' : `/${locale}`
    copy(`${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_DOMAIN}${localePath}/games/${game.id}`)
    toastify.alertSuccess(t.ALERT.COPIED)
  }

  return (
    <div className='sp-padding'>
      {/* Gmae Link */}
      <div className='form-group'>
        <label>{ t.MY_GAMES.EDIT.SETTINGS.GAME_LINK }</label>
        <div className='form-group-input mygames-edit-link'>
          <div className='mygames-edit-link-text'>
            <Link href={`/games/${game.id}`}>
              <div className='mygames-edit-link-text-url'>
                {`${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/games/${game.id}`}
              </div>
            </Link>
          </div>
          <div className='mygames-edit-link-copy' onClick={handleClickCopy}>
            <FontAwesomeIcon icon={faCopy} style={{marginLeft: '0.5rem'}} />
          </div>
        </div>
      </div>
      {/* Game Form */}
      <form id='game-form' onSubmit={e => e.preventDefault()}>
        {/* Public */}
        <Checkbox checked={isPublished} handleClick={handleClickVisibility} label={t.GAME.IS_PUBLISHED} text={t.FORM.PUBLIC} id='game-form-public' />
        {/* Title */}
        <div className='form-group'>
          <label htmlFor='game-title'>{ t.GAME.TITLE }</label>
          <div className='form-countable-input-group'>
            <input ref={inputTitleEl} type='text' id='game-title' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
            <div className='form-countable-input-counter'>{`${title.length} / 100`}</div>
          </div>
          <div ref={divTitleInvalidEl} id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Description */}
        <div className='form-group'>
          <label htmlFor='game-desc'>{ t.GAME.DESC }</label>
          <div className='form-countable-input-group'>
            <textarea id='game-desc' rows={8} maxLength={200} value={desc} onChange={e => setDesc(e.target.value)} />
            <div className='form-countable-input-counter'>{`${desc.length} / 200`}</div>
          </div>
          <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
        </div>
        {/* Challenge count */}
        <div className='form-group'>
          <Select id='game-challengeount' value={challengeCount} handleChange={handleChangeChallengeCount} label={t.GAME.CHALLENGE_COUNT}>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </Select>
        </div>
        {/* Character count */}
        <div className='form-group'>
          <label htmlFor='game-char-count'>{ t.GAME.CHARACTER_COUNT }</label>
          <input id='game-char-count' type='text' value={game.char_count} disabled={true} />
        </div>
        {/* Language */}
        <div className='form-group'>
          <label htmlFor='game-lang'>{ t.GAME.LANGUAGE }</label>
          <input id='game-lang' type='text' value={language.name} disabled={true} />
        </div>
        {/* Update */}
        <button type='button' id='game-submit' className='btn btn-primary' disabled={!isChanged} onClick={handleClickUpdate}>{ t.FORM.UPDATE }</button>
      </form>

      <LoadingOverlay showOverlay={showOverlay} />
    </div>
  )
}

export default Settings
