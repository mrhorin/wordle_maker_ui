import type { Token, Game, Word, Pagination } from 'types/global'
import { useEffect, useState, useRef, useCallback, memo, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons'

import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import Kaminari from 'components/kaminari'
import Select from 'components/form/select'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import cookie from 'scripts/cookie'
import validate from 'scripts/validate'
import { getCurrentWords, putWord, deleteWord } from 'scripts/api'

type TableStatus = 'INITIALIZING' | 'NO_RECORDS' | 'HAS_RECORDS' | 'IS_SUSPENDED' | 'UNAUTHORIZED' | 'REQUEST_FAILED'
type SortStatus = 'NAME_ASC' | 'NAME_DESC' | 'ID_ASC' | 'ID_DESC'

interface WordState {
  word: Word,
  isChecked: boolean,
}

interface EditWordsProps {
  game: Game
}

interface TrWordStateProps {
  wordState: WordState
  handleClickEdit(word: Word): void
  handleChangeCheckbox(wordState: WordState): void
}

const TrWordStateMemo = memo(({ wordState, handleClickEdit, handleChangeCheckbox }: TrWordStateProps) => {
  return (
    <tr>
      <td className='editwords-td-checkbox'>
        <div className='checkbox-bg-animation-container'>
          <input className='checkbox-default' type='checkbox'
            onChange={() => handleChangeCheckbox(wordState)} checked={wordState.isChecked} />
        </div>
      </td>
      <td className='editwords-td-word' onClick={() => handleClickEdit(wordState.word)}>{wordState.word.name}</td>
    </tr>
  )
})

TrWordStateMemo.displayName = "TrWordStateMemo"

const EditWords = ({ game }: EditWordsProps) => {
  /*
   * wordStateList:
   *  A list of word state. */
  const [wordStateList, setWordStateList] = useState<WordState[]>([])
  /* page:
   *  Pagenation infomation to render Pagination component.  */
  // const [page, setPage] = useState<Pagination | null>(null)
  const [page, setPage] = useState<Pagination>({
    total_count: 0,
    limit_value: 0,
    total_pages: 0,
    current_page: 0,
  })
  /* currentWord:
   *  A word clicked by a user for updating or deleting word in Modal.  */
  const [currentWord, setCurrentWord] = useState<Word>({ id: 0, name: "" })
  /* sortStatus:
   * current status of sort order of wordStateList. */
  const [sortStatus, setSortStatus] = useState<SortStatus>('NAME_ASC')
  /* showeModal:
   *  A flag indicates whether the delete modal window  is shown or not. */
  const [showModal, setShowModal] = useState<boolean>(false)
  /* showOverLay:
   *  A flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)
  const [isCheckedAll, setIsCheckedAll] = useState<boolean>(false)
  const [tableStatus, setTableStatus] = useState<TableStatus>('INITIALIZING')

  /*********** Ref ***********/
  const inputUpdateWordModalEl = useRef<HTMLInputElement>(null)
  const divInvalidWordModaldEl = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()
  const alert = useAlert()
  const language = useLanguage(game.lang)

  useEffect(() => {
    if (tableStatus == 'INITIALIZING') fetchPage(1)
  }, [])

  useEffect(() => {
    if (tableStatus != 'INITIALIZING') fetchPage(1)
  }, [sortStatus])

  const updateWord = useCallback((nextWord: Word) => {
    setWordStateList(prevWordStateList => {
      return prevWordStateList.map((prevWordState: WordState) => {
        if (prevWordState.word.id == nextWord.id) return { word: nextWord, isChecked: prevWordState.isChecked }
        return prevWordState
      })
    })
  }, [])

  const removeWord = useCallback((id: number) => {
    setWordStateList(prevWordStateList => {
      return prevWordStateList.filter((prevWordState: WordState) => {
        return prevWordState.word.id !== id
      })
    })
  }, [])

  const handleClickEdit = useCallback((word: Word) => {
    setCurrentWord(word)
    setShowModal(true)
  }, [])

  const handleChangeCheckbox = useCallback((wordState: WordState) => {
    setWordStateList(prevWordStateList => {
      return prevWordStateList.map((prevWordState: WordState) => {
        if (wordState.word.id == prevWordState.word.id) {
          return { word: prevWordState.word, isChecked: !wordState.isChecked }
        }
        return prevWordState
      })
    })
  }, [])

  function handleClickIsCheckedAll(): void {
    if (isCheckedAll) {
      setWordStateList(prevWordStateList => {
        return prevWordStateList.map((wordState: WordState) => {
          return { word: wordState.word, isChecked: false }
        })
      })
    } else {
      setWordStateList(prevWordStateList => {
        return prevWordStateList.map((wordState: WordState) => {
          return { word: wordState.word, isChecked: true }
        })
      })
    }
    setIsCheckedAll(!isCheckedAll)
  }

  function handleClickDelete(): void {
    let nextWord = { id: currentWord.id, name: currentWord.name, game_id: game.id }
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token) && validate.word(nextWord) && nextWord.id) {
      setShowOverlay(true)
      nprogress.start()
      deleteWord(token, nextWord.id).then(json => {
        alert.removeAll()
        if (json.ok && nextWord.id) {
          removeWord(nextWord.id)
          setShowModal(false)
          alert.show(t.ALERT.DELETED, { type: 'success' })
        } else {
          alert.show(t.ALERT.FAILED, { type: 'error' })
        }
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        nprogress.done()
        setShowOverlay(false)
      })
    } else {
      signOut(() => router.replace('/signin'))
    }
  }

  function handleClickDeleteCheckedWords(): void {
    const token: Token | null = cookie.client.loadToken()
    const ids: number[] = []
    for (let wordState of wordStateList) {
      if (wordState.isChecked) ids.push(wordState.word.id)
    }
    if (validate.token(token) && ids.length > 0) {
      setShowOverlay(true)
      nprogress.start()
      deleteWord(token, ids).then(json => {
        alert.removeAll()
        if (json.ok) {
          ids.forEach(id => removeWord(id))
          setShowModal(false)
          alert.show(t.ALERT.DELETED, { type: 'success' })
        } else {
          alert.show(t.ALERT.FAILED, { type: 'error' })
        }
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        nprogress.done()
        setShowOverlay(false)
      })
    }
  }

  function handleClickUpdate(): void {
    let nextWord = { id: currentWord.id, name: currentWord.name, game_id: game.id }
    const token: Token | null = cookie.client.loadToken()
    if (validate.wordWithGame(nextWord.name, game) && validate.word(nextWord)) {
      // Remove invalid style
      if (inputUpdateWordModalEl.current) inputUpdateWordModalEl.current.classList.remove('input-invalid')
      if (divInvalidWordModaldEl.current) divInvalidWordModaldEl.current.innerHTML = ''
      // Update a word
      if (validate.token(token)) {
        setShowOverlay(true)
        nprogress.start()
        putWord(token, nextWord as Word).then(json => {
          alert.removeAll()
          if (json.ok) {
            updateWord(json.data)
            setShowModal(false)
            alert.show(t.ALERT.UPDATED, { type: 'success' })
          } else {
            console.error(json)
            alert.show(t.ALERT.FAILED, { type: 'error' })
          }
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          nprogress.done()
          setShowOverlay(false)
        })
      } else {
        signOut(() => router.replace('/signin'))
      }
    } else if (inputUpdateWordModalEl.current && divInvalidWordModaldEl.current) {
      // Add invalid style
      inputUpdateWordModalEl.current.classList.add('input-invalid')
      divInvalidWordModaldEl.current.innerHTML = `Word must be ${game.char_count} characters in ${language.name}.`
    }
  }

  function handleClickPage(page: number): void{
    fetchPage(page)
  }

  function handleChangeCurrentWord(event: ChangeEvent<HTMLInputElement>): void {
    if (currentWord && event.target.value) {
      setCurrentWord({ id: currentWord.id, name: event.target.value })
    }
  }

  function handleChangeSort(event: ChangeEvent<HTMLSelectElement>): void {
    if (sortStatus && event.target.value) setSortStatus(event.target.value as SortStatus)
  }

  function getParams(page: number): string {
    let params = `?page=${page}`
    if (sortStatus == 'NAME_ASC') params += `&s=name&o=a`
    if (sortStatus == 'NAME_DESC') params += `&s=name&o=d`
    if (sortStatus == 'ID_ASC') params += `&s=id&o=a`
    if (sortStatus == 'ID_DESC') params += `&s=id&o=d`
    return params
  }

  function fetchPage(page: number): void{
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      nprogress.start()
      getCurrentWords(token, game, getParams(page)).then(json => {
        if (json.ok) {
          setWordStateList(json.data.words.map((word: Word) => {
            return { word: word, isChecked: false }
          }))
          setPage(json.data.pagination)
          setTableStatus(json.data.pagination.total_count > 0 ? 'HAS_RECORDS' : 'NO_RECORDS')
          document.body.scrollTop = 0 // For Safari
          document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
        } else if (json.isSuspended) {
          setTableStatus('IS_SUSPENDED')
        } else if (!json.isLoggedIn) {
          setTableStatus('UNAUTHORIZED')
        } else {
          setTableStatus('REQUEST_FAILED')
        }
      }).catch(error => {
        console.error(error)
        setTableStatus('REQUEST_FAILED')
      }).finally(
        () => nprogress.done()
      )
    } else {
      signOut(() => router.push('/signin'))
    }
  }

  const trWordStateMemoComponents: JSX.Element[] = wordStateList.map((wordState) => {
    return <TrWordStateMemo key={wordState.word.id} wordState={wordState}
      handleClickEdit={handleClickEdit} handleChangeCheckbox={handleChangeCheckbox} />
  })

  return (
    <div className='editwords sp-padding'>
      {/* Edit word window */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='modal-window-container'>
          <div className='modal-window-header'>
            {t.COMMON.EDIT}
          </div>
          <div className='modal-window-body'>
            <div className='form-group'>
              <label>{ t.COMMON.WORD }</label>
              <div className='form-countable-input-group'>
                <input ref={inputUpdateWordModalEl} value={currentWord?.name} type='text'
                  maxLength={game.char_count} onChange={e => handleChangeCurrentWord(e)} />
                <div className='form-countable-input-counter'>
                  {`${currentWord?.name.length} / ${game.char_count}`}
                </div>
              </div>
              <div ref={divInvalidWordModaldEl} className='form-group-invalid-feedback'></div>
            </div>
          </div>
          <div className='modal-window-footer'>
            <button className='btn btn-mini btn-square btn-default'
              onClick={() => setShowModal(false)}>{t.COMMON.CLOSE}</button>
            <button className='btn btn-mini btn-square btn-danger'
              onClick={handleClickDelete}>{t.COMMON.DELETE}</button>
            <button className='btn btn-mini btn-square btn-primary'
              onClick={handleClickUpdate}>{t.FORM.UPDATE}</button>
          </div>
        </div>
      </Modal>

      <LoadingOverlay showOverlay={showOverlay} />

      {/* word list */}
      {(() => {
        if (tableStatus == 'HAS_RECORDS') {
          return (
            <table>
              <thead>
                <tr>
                  <th className='editwords-th-checkbox'>
                    <div className='checkbox-bg-animation-container'>
                      <input className='checkbox-default' type='checkbox' onChange={handleClickIsCheckedAll} />
                    </div>
                  </th>
                  <th className='editwords-th-ctrlpanel'>
                    {/* sort by */}
                    <div className='editwords-th-ctrlpanel-item'>
                      <div className='editwords-btn'>
                        <FontAwesomeIcon icon={faArrowDownAZ} />
                      </div>
                      <Select handleChange={handleChangeSort} value={sortStatus}>
                        <option value={'NAME_ASC'}>{t.MY_GAMES.EDIT.EDIT_WORDS.SORT.ALPHABET_ASC}</option>
                        <option value={'NAME_DESC'}>{t.MY_GAMES.EDIT.EDIT_WORDS.SORT.ALPHABET_DESC}</option>
                        <option value={'ID_ASC'}>{t.MY_GAMES.EDIT.EDIT_WORDS.SORT.NEWEST_ASC}</option>
                        <option value={'ID_DESC'}>{t.MY_GAMES.EDIT.EDIT_WORDS.SORT.NEWEST_DESC}</option>
                      </Select>
                    </div>
                    {/* buttons */}
                    <div className='editwords-th-ctrlpanel-item'>
                      {/* delete */}
                      <div className='btn-bg-animation-container'>
                        <div className='editwords-btn' onClick={handleClickDeleteCheckedWords}>
                          <FontAwesomeIcon icon={faTrashCan} />
                        </div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>{trWordStateMemoComponents}</tbody>
            </table>
          )
        }
        if (tableStatus == 'INITIALIZING') return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
        if (tableStatus == 'NO_RECORDS') return <p>Looks like you have not created anything yet..?</p>
        if (tableStatus == 'REQUEST_FAILED') return <p>取得に失敗しました</p>
        if (tableStatus == 'IS_SUSPENDED') return <p>このゲームは凍結されています</p>
        if (tableStatus == 'UNAUTHORIZED') return <p>認証に失敗しました</p>
      })()}
      <Kaminari page={page} handleClickPage={handleClickPage} />
    </div>
  )
}

export default EditWords
