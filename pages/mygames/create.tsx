import type { Token, Game } from 'types/global'
import { useRouter } from 'next/router'
import React, { useState, useRef, useContext } from 'react'
import { useAlert } from 'react-alert'

import useSignOut from 'hooks/useSignOut'
import useLocale from 'hooks/useLocale'

import Head from 'next/head'
import nprogress from 'nprogress'

import SlideoutMenu from 'components/slideout_menu'
import Sidemenu from 'components/sidemenu'
import LoadingOverlay from 'components/loading_overlay'

import cookie from 'scripts/cookie'
import { postGame } from 'scripts/api'
import validate from 'scripts/validate'
import Select from 'components/form/select'

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

  const signOut = useSignOut()
  const router = useRouter()
  const { t } = useLocale()
  const alert = useAlert()

  function validateTitle(): boolean{
    const titleLength: number = Number(title.length)
    if (titleLength < 1) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '*' + t.VALIDATE.GAME.TITLE.REQUIRED
      return false
    } else if (titleLength > 100) {
      inputTitleEl.current?.classList.add('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = '*' + t.VALIDATE.GAME.TITLE.CHARS_OR_LESS
      return false
    } else {
      inputTitleEl.current?.classList.remove('input-invalid')
      if (divTitleInvalidEl.current) divTitleInvalidEl.current.innerHTML = ''
      return true
    }
  }

  function handleChangeChallengeCount(event: React.ChangeEvent<HTMLSelectElement>): void{
    setChallengeCount(Number(event.target.value))
  }

  function handleChangeCharCount(event: React.ChangeEvent<HTMLSelectElement>): void{
    setCharCount(Number(event.target.value))
  }

  function handleChangeLang(event: React.ChangeEvent<HTMLSelectElement>): void{
    setLang(event.target.value)
  }

  function handleClickSubmit(): void{
    const token: Token | null = cookie.client.loadToken()
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
          is_published: false,
        }
        postGame(token, nextGame).then(json => {
          alert.removeAll()
          if (json.ok) {
            alert.show(t.ALERT.CREATED, { type: 'success' })
            router.push(`/mygames/edit/${json.data.id}?t=2`)
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
      signOut(() => router.replace('/signin'))
    }
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${t.MY_GAMES.CREATE.TITLE} | ${t.APP_NAME}`}</title>
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
                  <input ref={inputTitleEl} type='text' id='game-title' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
                  <div className='form-countable-input-counter'>{`${title.length} / 100`}</div>
                </div>
                <div ref={divTitleInvalidEl} id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
              </div>
              {/* Description */}
              <div className='form-group'>
                <label>{ t.GAME.DESC }</label>
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
                <Select id='game-charcount' value={charCount} handleChange={handleChangeCharCount} label={t.GAME.CHARACTER_COUNT}>
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
              {/* Language */}
              <div className='form-group'>
                <Select id='game-lang' value={lang} handleChange={handleChangeLang} label={t.GAME.LANGUAGE}>
                  <option value='en'>English</option>
                  <option value='ja'>Japanese</option>
                </Select>
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
