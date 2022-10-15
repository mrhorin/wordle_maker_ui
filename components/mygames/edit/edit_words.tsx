import type { Token, Game, Word, Pagination } from 'types/global'
import { useEffect, useState, useRef, useCallback, memo } from 'react'
import { useRouter } from 'next/router'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'

import useLanguage from 'hooks/useLanguage'
import useLocale from 'hooks/useLocale'
import useSignOut from 'hooks/useSignOut'

import PaginationComponent from 'components/pagination'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import { ClientSideCookies } from 'scripts/cookie'
import validate from 'scripts/validate'
import { getCurrentWords, putWord, deleteWord } from 'scripts/api'

interface TrWordProps {
  word: Word
  handleClickEdit(word: Word): void
  handleClickDelete(word_id: number): void
}

const TrWordMemo = memo(({ word, handleClickEdit, handleClickDelete }: TrWordProps) => {
  const { t } = useLocale()

  return (
    <tr>
      <td className='table-td-word'>{ word.name }</td>
      <td className='table-td-edit'>
        <button className='btn btn-mini btn-square btn-secondary' onClick={() => handleClickEdit(word)}>{ t.COMMON.EDIT }</button>
      </td>
      <td className='table-td-delete'>
        <button className='btn btn-mini btn-square btn-danger' onClick={() => handleClickDelete(word.id)}>
          { t.COMMON.DELETE }
        </button>
      </td>
    </tr>
  )
})

TrWordMemo.displayName = 'TrWordMemo'

interface EditWordsProps {
  game: Game
}

const EditWords = ({ game }: EditWordsProps) => {
  /*
   * currentWordList:
   *  A list of words. */
  const [currentWordList, setCurrentWordList] = useState<Word[]>([])
  /* pagination:
   *  Pagenation infomation to render PaginationComponent.  */
  const [pagination, setPagination] = useState<Pagination | null>(null)
  /* inputUpdateWord:
   * inputUpdateId:
   *  A value of InputUpdateWordModalEl for updating word in Modal.  */
  const [inputUpdateWord, setInputUpdateWord] = useState<string>('')
  const [inputUpdateId, setInputUpdateId] = useState<number>()
  /* showeModal:
   *  A flag indicates whether the delete modal window  is shown or not. */
  const [showModal, setShowModal] = useState<boolean>(false)
  /* showOverLay:
   *  A flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)

  /*********** Ref ***********/
  const inputUpdateWordModalEl = useRef<HTMLInputElement>(null)
  const divInvalidWordModaldEl = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { t } = useLocale()
  const signOut = useSignOut()
  const alert = useAlert()
  const language = useLanguage(game.lang)

  useEffect(() => {
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token) && currentWordList.length <= 0) {
      // When currentWordList is empty
      if ((pagination == null) || (pagination.total_count > 0)) {
        // When rendered at first OR words exists, it fetches words
        nprogress.start()
        getCurrentWords(token, game, 1).then(json => {
          if (json.ok) {
            setPagination(json.data.pagination)
            setCurrentWordList(json.data.words)
          }
        }).catch(error => {
          console.log(error)
        }).finally(
          () => nprogress.done()
        )
      }
    }
  }, [currentWordList])

  const updateWord = useCallback((nextWord: Word) => {
    setCurrentWordList(prevCuurentWordList => {
      return prevCuurentWordList.map((prevWord) => {
        if (prevWord.id == nextWord.id) return nextWord
        return prevWord
      })
    })
  }, [])

  const removeWord = useCallback((id: number) => {
    setCurrentWordList(prevCuurentWordList => {
      return prevCuurentWordList.filter((prevWord) => {
        return prevWord.id !== id
      })
    })
  }, [])

  const handleClickEdit = useCallback((word: Word) => {
    setInputUpdateWord(word.name)
    setInputUpdateId(word.id)
    setShowModal(true)
  }, [])

  const handleClickDelete = useCallback((word_id: number) => {
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      setShowOverlay(true)
      nprogress.start()
      deleteWord(token, word_id).then(json => {
        alert.removeAll()
        if (json.ok) {
          removeWord(word_id)
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
  }, [])

  function handleClickUpdate() {
    let nextWord = { id: inputUpdateId, name: inputUpdateWord, game_id: game.id }
    const token: Token | null = ClientSideCookies.loadToken()
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
          console.log(error)
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
    const token: Token | null = ClientSideCookies.loadToken()
    if (validate.token(token)) {
      nprogress.start()
      getCurrentWords(token, game, page).then(json => {
        if (json.ok) {
          setCurrentWordList(json.data.words)
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

  if (pagination?.total_count == 0) {
    // When words don't exist after fetching words and pagination data
    return (
      <div className='mygames-edit-main'>
        <p style={{textAlign: 'center', margin: '10rem auto'}}>Looks like you have not created anything yet..?</p>
      </div>
    )
  } else if (currentWordList.length <= 0) {
    // When words don't exist before fetching words and pagination data
    return (
      <div className='mygames-edit-main'>
        <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
      </div>
    )
  } else {
    // When words exist
    const wordComponents = currentWordList.map((s) => {
      return <TrWordMemo key={s.id} word={s} handleClickEdit={handleClickEdit} handleClickDelete={handleClickDelete} />
    })
    return (
      <>
        {/* Modal */}
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <div className='modal-window-container'>
            <div className='modal-window-header'>
              {t.COMMON.EDIT}
            </div>
            <div className='modal-window-body'>
              <div className='form-group'>
                <label>{ t.COMMON.WORD }</label>
                <div className='form-countable-input-group'>
                  <input ref={inputUpdateWordModalEl} value={inputUpdateWord} type='text' maxLength={game.char_count} onChange={e => setInputUpdateWord(e.target.value)} />
                  <div className='form-countable-input-counter'>{`${inputUpdateWord.length} / ${game.char_count}`}</div>
                </div>
                <div ref={divInvalidWordModaldEl} className='form-group-invalid-feedback'></div>
              </div>
            </div>
            <div className='modal-window-footer'>
              <button className='btn btn-primary' onClick={handleClickUpdate}>{t.FORM.UPDATE }</button>
              <button className='btn btn-default' onClick={() => setShowModal(false)}>{ t.COMMON.CLOSE }</button>
            </div>
          </div>
        </Modal>
        {/* LoadingOverlay */}
        <LoadingOverlay showOverlay={showOverlay} />

        <table>
          <thead>
            <tr>
              <th className='table-th-word'>{ t.COMMON.WORD }</th>
              <th className='table-th-date-edit'>{ t.COMMON.EDIT }</th>
              <th className='table-th-date-delete'>{ t.COMMON.DELETE }</th>
            </tr>
          </thead>
          <tbody>{ wordComponents }</tbody>
        </table>
        {(() => {
          if (pagination && pagination.total_pages > 1) {
            return <PaginationComponent pagination={pagination} handleClickPage={handleClickPage} />
          }
        })()}
      </>
    )
  }
}

export default EditWords
