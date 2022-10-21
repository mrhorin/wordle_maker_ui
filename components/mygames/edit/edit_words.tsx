import type { Token, Game, Word, Pagination } from 'types/global'
import { useEffect, useState, useRef, useCallback, memo, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'

import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import PaginationComponent from 'components/pagination'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import cookie from 'scripts/cookie'
import validate from 'scripts/validate'
import { getCurrentWords, putWord, deleteWord } from 'scripts/api'

type TableStatus = 'INITIALIZING' | 'NO_RECORDS' | 'HAS_RECORDS' | 'IS_SUSPENDED' | 'UNAUTHORIZED' | 'REQUEST_FAILED'

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
        <input className='checkbox-default' type='checkbox'
          onChange={() => handleChangeCheckbox(wordState)} checked={wordState.isChecked} />
      </td>
      <td className='editwords-td-word' onClick={() => handleClickEdit(wordState.word)}>{wordState.word.name}</td>
    </tr>
  )
})

const EditWords = ({ game }: EditWordsProps) => {
  /*
   * wordStateList:
   *  A list of word state. */
  const [wordStateList, setWordStateList] = useState<WordState[]>([])
  /* pagination:
   *  Pagenation infomation to render PaginationComponent.  */
  // const [pagination, setPagination] = useState<Pagination | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total_count: 0,
    limit_value: 0,
    total_pages: 0,
    current_page: 0,
  })
  /* currentWord:
   *  A word clicked by a user for updating or deleting word in Modal.  */
  const [currentWord, setCurrentWord] = useState<Word>({id: 0, name: ""})
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
    const token: Token | null = cookie.client.loadToken()
    if (tableStatus == 'INITIALIZING') {
      if (validate.token(token)) {
        nprogress.start()
        getCurrentWords(token, game, 1).then(json => {
          if (json.ok) {
            setWordStateList(json.data.words.map((word: Word) => {
              return { word: word, isChecked: false }
            }))
            setPagination(json.data.pagination)
            setTableStatus(json.data.pagination.total_count > 0 ? 'HAS_RECORDS' : 'NO_RECORDS')
          } else if (!json.isSuspended) {
            setTableStatus('IS_SUSPENDED')
          } else if (!json.isLoggedIn) {
            setTableStatus('UNAUTHORIZED')
          } else {
            setTableStatus('REQUEST_FAILED')
          }
        }).catch(error => {
          console.log(error)
          setTableStatus('NO_RECORDS')
        }).finally(
          () => nprogress.done()
        )
      } else {
        setTableStatus('UNAUTHORIZED')
      }
    }
  }, [])

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
        console.log(error)
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
    const token: Token | null = cookie.client.loadToken()
    if (validate.token(token)) {
      nprogress.start()
      getCurrentWords(token, game, page).then(json => {
        if (json.ok) {
          setWordStateList(json.data.words.map((word: Word) => {
            return { word: word, isChecked: false }
          }))
          setPagination(json.data.pagination)
          document.body.scrollTop = 0 // For Safari
          document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
        }
      }).catch(error => {
        console.log(error)
      }).finally(
        () => nprogress.done()
      )
    } else {
      signOut(() => router.replace('/signin'))
    }
  }

  function handleChangeCurrentWord(event: ChangeEvent<HTMLInputElement>): void {
    if (currentWord && event.target.value) {
      setCurrentWord({ id: currentWord.id, name: event.target.value })
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
                    <input className='checkbox-default' type='checkbox' onChange={handleClickIsCheckedAll} />
                  </th>
                  <th className='editwords-th-word'>
                    <div className='editwords-btn' onClick={handleClickDeleteCheckedWords}>
                      <FontAwesomeIcon icon={faTrashCan} />
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
      <PaginationComponent pagination={pagination} handleClickPage={handleClickPage} />
    </div>
  )
}

export default EditWords
