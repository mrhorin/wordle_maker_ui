import type { Token, Game } from 'types/global'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'
import { useAlert } from 'react-alert'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import Head from 'next/head'
import nprogress from 'nprogress'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import LoadingOverlay from 'components/loading_overlay'

import { ClientSideCookies } from 'scripts/cookie'
import { postGame } from 'scripts/api'
import validate from 'scripts/validate'

const MygamesCreate = () => {
  /********** State **********/
  const [title, setTitle] = useState<string>('')
  const [desc, setDesc] = useState<string>('')
  const [lang, setLang] = useState<string>('en')
  const [challengeCount, setChallengeCount] = useState<number>(6)
  const [charCount, setCharCount] = useState<number>(5)
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*********** Ref ***********/
  const inputTitleEl = useRef<HTMLInputElement>(null)
  const divTitleInvalidEl = useRef<HTMLDivElement>(null)
  const selectLangEl = useRef<HTMLSelectElement>(null)

  const signOut = useSignOut()
  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()

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

  function handleClickSubmit(): void{
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      if (validateTitle()) {
        setShowOverlay(true)
        nprogress.start()
        const nextGame: Game = {
          title: title,
          desc: desc,
          lang: lang,
          char_count: charCount,
          challenge_count: challengeCount,
        }
        postGame(token, nextGame).then(json => {
          if (json.ok) {
            alert.show(t.ALERT.CREATED, { type: 'success' })
            router.push(`/mygames/edit/${json.data.id}#add-words`)
          } else {
            alert.show(json.message, {type: 'error'})
            console.error(json)
            setShowOverlay(false)
          }
        }).catch(error => {
          console.error(error)
          setShowOverlay(false)
        }).finally(() => { nprogress.done() })
      }
    } else {
      signOut(() => router.replace('/signup'))
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>{t.MY_GAMES.CREATE.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div id='sidemenu-container'>
          {/* Sidemenu */}
          <Sidemenu activeMenu={'create' }/>
          {/* Main */}
          <div id='sidemenu-main'>
            <div className='title'>
              <div className='title-text'>{ t.MY_GAMES.CREATE.TITLE }</div>
            </div>

            {/* Game Form */}
            <form id='game-form' className='sp-padding' onSubmit={e => e.preventDefault()}>
              {/* Title */}
              <div className='form-group'>
                <label>{ t.GAME.TITLE }</label>
                <div className='form-countable-input-group'>
                  <input ref={inputTitleEl} id='game-title' type='text' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
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
                <select id='game-charcount' value={charCount} onChange={e => setCharCount(Number(e.target.value))}>
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
              {/* Language */}
              <div className='form-group'>
                <label>{ t.GAME.LANGUAGE }</label>
                <select ref={selectLangEl} id='game-lang' value={lang} onChange={e => setLang(e.target.value)}>
                  <option value='en'>English</option>
                  <option value='ja'>Japanese</option>
                </select>
              </div>
              {/* Submit */}
              <button type='button' id='game-submit' className='btn btn-primary' disabled={title.length < 1 || title.length > 100} onClick={handleClickSubmit}>
              { t.FORM.SUBMIT }
              </button>
            </form>
            <LoadingOverlay showOverlay={showOverlay} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesCreate
