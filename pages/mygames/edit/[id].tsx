import type { UserInfo, Token, Game, Subject, Chip } from 'types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useLayoutEffect, useState, useContext, useMemo, useRef } from 'react'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import Link from 'next/link'
import Head from 'next/head'
import nookies from 'nookies'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'

import Sidemenu from 'components/sidemenu'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'
import ChipTextarea from 'components/form/chip_textarea'

import CurrentTokenContext from 'contexts/current_token'
import CurrentUserInfoContext from 'contexts/current_user_info'
import ChipsContext from 'contexts/chips'

import validate from 'scripts/validate'
import Language from 'scripts/language'

const tabs: string[] = ['Summary', 'Add Words', 'Edit Words','Delete Game']

type Props = { token: Token, userInfo: UserInfo }

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context)
  const token: Token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  const userInfo: UserInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  const props: Props = {
    token: token,
    userInfo: userInfo
  }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: {
        statusCode: 302,
        destination: '/signup',
      }
    }
  }
}

const MygamesEdit = (props: Props) => {
  /*
   * originalGame:
   *  The original value of the game.
   *  This state is initialized in useLayoutEffect function and
   *  will be changed after updating the game by fetching API.
   *
   * isChanged:
   *  The flag indicates that parameters are changed in the game form or not.
  */
  /********** State **********/
  const [originalGame, setOriginalGame] = useState<Game>()
  const [title, setTitle] = useState<string>('')
  const [desc, setDesc] = useState<string>('')
  const [lang, setLang] = useState<string>('en')
  const [charCount, setCharCount] = useState<number>(5)
  const [id, setId] = useState<number>()
  const [chips, setChips] = useState<Chip[]>([])
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const [currentTab, setCurrentTab] = useState<string>('Summary')
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  /*********** Ref ***********/
  const inputTitleEl = useRef<HTMLInputElement>(null)
  const divTitleInvalidEl = useRef<HTMLDivElement>(null)
  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)
  const currentUserInfoContext = useContext(CurrentUserInfoContext)
  /*********** Memo ***********/
  const handleConfirmation = useMemo(() => {
    return () => {
      setCheckedConfirmation(!checkedConfirmation);
    }
  }, [checkedConfirmation])

  const router = useRouter()
  const alert = useAlert()
  const language: Language = new Language(lang)

  useLayoutEffect(() => {
    if (validate.token(props.token)) {
      const gameId: string = location.pathname.split('/')[3]
      fetchGame(props.token, gameId).then((json) => {
        if (json.ok) {
          setOriginalGame(json.data as Game)
          setGame(json.data as Game)
        }
      })
    } else {
      signOut()
    }
  }, [])

  useEffect(() => {
    if (originalGame?.title != title || originalGame?.desc != desc) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [title, desc, originalGame])

  function setGame(game: Game): void{
    setTitle(game.title)
    setDesc(game.desc)
    setLang(game.lang)
    setCharCount(Number(game.char_count))
    if (game.id) setId(Number(game.id))
  }

  function signOut(): void{
    currentTokenContext.setCurrentToken(null)
    currentTokenContext.destroyTokenCookies()
    currentUserInfoContext.setCurrentUserInfo(null)
    currentUserInfoContext.destroyUserInfoCookies()
    router.replace('/signup')
  }

  function createTabsComponent(): JSX.Element{
    const tabComponents = tabs.map((t, index) => {
      let style = 'tab'
      if (currentTab == t) style += ' tab-active'
      return <div className={style} onClick={() => { setCurrentTab(t) }} key={index}>{t}</div>
    })
    return (
      <div className='tabs-container'>{tabComponents}</div>
    )
  }

  function createSummaryComponent(): JSX.Element{
    return (
      <div className='game-edit-summary'>
        <form id='game-form' onSubmit={e => e.preventDefault()}>
          {/* Gmae Link */}
          {createGameLinkComponent()}
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
            <input type='text' value={charCount} disabled={true} />
          </div>
          {/* Submit */}
          <button type='button' id='game-submit' className='btn btn-primary' disabled={!isChanged} onClick={handleClickUpdate}>Update</button>
        </form>
      </div>
    )
  }

  function createAddComponent(): JSX.Element {
    const count = chips.map(c => c.value).join('').length
    return (
      <ChipsContext.Provider value={{ chips, addChips, removeChip, updateChip }}>
        <div className='game-add-words'>
          <div className='form-group'>
            <label>Words</label>
            <div className='form-countable-input-group'>
              <ChipTextarea />
              <div className='form-countable-input-counter'>{`${count} / 5000`}</div>
            </div>
          </div>
          <button className='btn btn-primary' disabled={!validateWords() || 0 == chips.length} onClick={handleClickSubmit}>Submit</button>
        </div>
      </ChipsContext.Provider>
    )
  }

  function createEditComponent(): JSX.Element{
    const subjects: Subject[] = [
      { word: 'ティラノシショウ', created_at: '2022/4/16' },
      { word: 'アタマデカチモン', created_at: '2022/4/16' },
      { word: 'マリンキメラモン', created_at: '2022/4/16' },
      { word: 'トノサマゲコモン', created_at: '2022/4/16' },
      { word: 'エンジェウーモン', created_at: '2022/4/16' },
      { word: 'スカルグレイモン', created_at: '2022/4/16' },
      { word: 'メタルグレイモン', created_at: '2022/4/16' },
      { word: 'ウォーグレイモン', created_at: '2022/4/16' },
      { word: 'サーベルレオモン', created_at: '2022/4/16' },
      { word: 'ワルモンザエモン', created_at: '2022/4/16' },
      { word: 'メタルガルルモン', created_at: '2022/4/16' },
    ]
    const subjectComponents = subjects.map((s, i) => {
      return (
        <tr key={i}>
          <td className='table-td-word'>{ s.word }</td>
          <td className='table-td-date-created'>{ s.created_at }</td>
          <td className='table-td-edit'><button className='btn btn-mini btn-default'><FontAwesomeIcon icon={faPenToSquare} /></button></td>
          <td className='table-td-delete'><button className='btn btn-mini btn-danger'><FontAwesomeIcon icon={faTrashCan} /></button></td>
        </tr>
      )
    })
    return (
      <div className='game-edit-words'>
        <table>
          <thead>
            <tr>
              <th className='table-th-word'>Word</th>
              <th className='table-th-date-created'>Date Created</th>
              <th className='table-th-date-edit'>Edit</th>
              <th className='table-th-date-delete'>Delete</th>
            </tr>
          </thead>
          <tbody>{ subjectComponents }</tbody>
        </table>
      </div>
    )
  }

  function createDeleteComponent(): JSX.Element{
    return (
      <div className='game-edit-delete' style={{ marginTop: '1rem' }}>
        <button className='btn btn-danger' onClick={() => { setShowModal(true) }}>Delete Game</button>
      </div>
    )
  }

  function createGameLinkComponent(): JSX.Element{
    return (
      <div className='game-edit-link'>
        <label>Game Link</label>
        <Link href={`/games/${id}`}>
          <a className='sidemenu-item sidemenu-item-mygames-create'>
            {`http://localhost:8000/games/${id}`}
          </a>
        </Link>
      </div>
    )
  }

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

  function validateWords(): boolean{
    const language: Language = new Language(lang)
    let isValid: boolean = true
    if (chips.length <= 0) isValid = false
    for (const c of chips) {
      if (c.value.length != charCount || !language.validateWord(c.value)) {
        isValid = false
        break
      }
    }
    return isValid
  }

  function addChips(inputList: string[]): void{
    const newChips = inputList.map((input) => {
      const isValid = input.length == charCount && language.validateWord(input)
      return { value: input, isValid: isValid }
    })
    setChips(chips.concat(newChips))
  }

  function removeChip(index: number): void{
    if (Number(index) >= 0) {
      let newChips = chips.filter((chip, i) => {
        return i !== Number(index)
      })
      setChips(newChips)
    }
  }

  function updateChip(index: number, value: string): void{
    const newChips: Chip[] = chips.map((c, i) => {
      if (i == index) {
        return  {
          value: value,
          isValid: charCount == value.length && language.validateWord(value)
        }
      }
      return c
    })
    setChips(newChips)
  }

  function handleClickUpdate(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        const body = {
          game: {
            'id': id,
            'title': title,
            'desc': desc,
          }
        }
        setShowOverlay(true)
        fetch(`http://localhost:3000/api/v1/games/${id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              alert.show('UPDATED', { type: 'success' })
              setOriginalGame(json.data as Game)
            } else {
              alert.show('FAILED', {type: 'error'})
            }
          })
          .catch(error => console.log(error))
          .finally(() => setShowOverlay(false))
      }
    } else {
      signOut()
    }
  }

  function handleClickSubmit(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateWords() && id) {
        const words = chips.map(c => c.value)
        const body = { words: words, game: { game_id: id } }
        fetch(`http://localhost:3000/api/v1/subjects/create`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'access-token': currentTokenContext.currentToken.accessToken,
            'client': currentTokenContext.currentToken.client,
            'uid': currentTokenContext.currentToken.uid
          },
          body: JSON.stringify(body)
        }).then(res => res.json())
          .then(json => {
            if (json.ok) {
              setChips([])
              alert.show(language.succeedMsg, { type: 'success' })
            } else {
              alert.show(language.failedMsg, { type: 'error' })
            }
          })
          .catch(error => console.log(error))
      } else {
        alert.show(language.getInvalidMsg(charCount), { type: 'error' })
      }
    } else {
      signOut()
    }
  }

  function handleClickDelete(): void{
    if (validate.token(currentTokenContext.currentToken)) {
      if (validateTitle()) {
        setShowOverlay(true)
        fetch(`http://localhost:3000/api/v1/games/${id}`, {
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
              alert.show('DELETED', {type: 'success'})
              router.replace('/mygames/edit')
            } else {
              alert.show('FAILED', {type: 'error'})
              console.error(json.message)
            }
          })
          .catch(error => { setShowOverlay(false) })
      }
    }
  }

  async function fetchGame(token: Token, gameId: string) {
    const res = await fetch(`http://localhost:3000/api/v1/games/${gameId}`, {
      method: 'GET',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  return (
    <main id='main'>
      <Head>
        <title>Edit {`${title}`}: WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Modal */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            Delete Game
          </div>
          <div className='modal-window-body'>
            <p>Are you sure?</p>
            <ol>
              <li>The game will be deleted.</li>
              <li>We can't recover it.</li>
              <li>If you send an inquiry to us about it, we can't reply to you.</li>
            </ol>
            <div>
            <input type="checkbox" id="confirmation" checked={checkedConfirmation} onChange={handleConfirmation} />
            <span style={{ fontWeight: '500' }}>I agree.</span>
          </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-danger' disabled={!checkedConfirmation} onClick={handleClickDelete}>Delete</button>
            <button className='btn btn-default' onClick={()=>setShowModal(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit'}/>
          <div id='sidemenu-main'>
            <h1 className='title'>Edit games</h1>
            {createTabsComponent()}
            {(() => {
              if (id) {
                if (currentTab == tabs[0]) return createSummaryComponent()
                if (currentTab == tabs[1]) return createAddComponent()
                if (currentTab == tabs[2]) return createEditComponent()
                if (currentTab == tabs[3]) return createDeleteComponent()
              } else {
                return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
              }
            })()}
            <LoadingOverlay showOverlay={showOverlay} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
