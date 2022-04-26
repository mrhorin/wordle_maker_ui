import type { Token, Game, Subject, Pagination } from 'types/global'
import { useEffect, useState, useRef, useContext, useCallback, memo } from 'react'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'

import PaginationComponent from 'components/pagination'
import Modal from 'components/modal'
import LoadingOverlay from 'components/loading_overlay'

import CurrentTokenContext from 'contexts/current_token'

import validate from 'scripts/validate'
import Language from 'scripts/language'

interface TrSubjectProps {
  subject: Subject
  handleClickEdit(subject: Subject): void
  handleClickDelete(subject_id: number): void
}

const TrSubjectMemo = memo(({ subject, handleClickEdit, handleClickDelete }: TrSubjectProps) => {
  return (
    <tr>
      <td className='table-td-word'>{ subject.word }</td>
      <td className='table-td-edit'>
        <button className='btn btn-mini btn-square btn-secondary' onClick={()=> handleClickEdit(subject)}>Edit</button>
      </td>
      <td className='table-td-delete'>
        <button className='btn btn-mini btn-square btn-danger' onClick={() => handleClickDelete(subject.id)}>
          Delete
        </button>
      </td>
    </tr>
  )
})

interface EditWordsProps {
  game: Game
}

const EditWords = ({ game }: EditWordsProps) => {
  /*
   * currentSubjectList:
   *  A list of subjects. */
  const [currentSubjectList, setCurrentSubjectList] = useState<Subject[]>([])
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
  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

  const alert = useAlert()
  const language = new Language(game.lang)

  useEffect(() => {
    if (validate.token(currentTokenContext.currentToken) && currentSubjectList.length <= 0) {
      // When currentSubjectList is empty
      if ((pagination == null) || (pagination.total_count > 0)) {
        // When rendered at first OR subjects exists, it fetches subjects
        nprogress.start()
        fetchSubjects(currentTokenContext.currentToken, 1).then(json => {
          if (json.ok) {
            setPagination(json.data.pagination)
            setCurrentSubjectList(json.data.subjects)
          }
        }).finally(() => nprogress.done())
      }
    }
  }, [currentSubjectList])

  const updateSubject = useCallback((nextSubject: Subject) => {
    setCurrentSubjectList(prevCuurentSubjectList => {
      return prevCuurentSubjectList.map((prevSubject) => {
        if (prevSubject.id == nextSubject.id) return nextSubject
        return prevSubject
      })
    })
  }, [])

  const removeSubject = useCallback((id: number) => {
    setCurrentSubjectList(prevCuurentSubjectList => {
      return prevCuurentSubjectList.filter((prevSubject) => {
        return prevSubject.id !== id
      })
    })
  }, [])

  const handleClickEdit = useCallback((subject: Subject) => {
    setInputUpdateWord(subject.word)
    setInputUpdateId(subject.id)
    setShowModal(true)
  }, [])

  const handleClickDelete = useCallback((subject_id: number) => {
    if (validate.token(currentTokenContext.currentToken)) {
      setShowOverlay(true)
      nprogress.start()
      fetchDeleteSubject(currentTokenContext.currentToken, subject_id).then(json => {
        if (json.ok) {
          removeSubject(subject_id)
          alert.show('Deleted', { type: 'success' })
        } else {
          alert.show('Failed', { type: 'error' })
        }
      }).finally(() => {
        nprogress.done()
        setShowOverlay(false)
      })
    }
  }, [])

  function handleClickUpdate() {
    let newSubject = { id: inputUpdateId, word: inputUpdateWord, game_id: game.id }
    if (validate.wordWithGame(newSubject.word, game) && validate.subject(newSubject)) {
      // Remove invalid style
      if (inputUpdateWordModalEl.current) inputUpdateWordModalEl.current.classList.remove('input-invalid')
      if (divInvalidWordModaldEl.current) divInvalidWordModaldEl.current.innerHTML = ''
      // Update a subject
      if (validate.token(currentTokenContext.currentToken)) {
        setShowOverlay(true)
        nprogress.start()
        fetchUpdateSubject(currentTokenContext.currentToken, newSubject as Subject).then(json => {
          if (json.ok) {
            updateSubject(json.data)
            setShowModal(false)
            alert.show('Updated', { type: 'success' })
          } else {
            console.error(json)
            alert.show('Failed', { type: 'error' })
          }
        }).catch(error => {
          console.log(error)
        }).finally(() => {
          nprogress.done()
          setShowOverlay(false)
        })
      }
    } else if (inputUpdateWordModalEl.current && divInvalidWordModaldEl.current) {
      // Add invalid style
      inputUpdateWordModalEl.current.classList.add('input-invalid')
      divInvalidWordModaldEl.current.innerHTML = `Word must be ${game.char_count} characters in ${language.name}.`
    }
  }

  function handleClickPage(page: number): void{
    if (validate.token(currentTokenContext.currentToken)) {
      nprogress.start()
      fetchSubjects(currentTokenContext.currentToken, page).then(json => {
        if (json.ok) {
          setCurrentSubjectList(json.data.subjects)
          setPagination(json.data.pagination)
        }
      }).finally(() => nprogress.done())
    }
  }

  async function fetchSubjects(token: Token, page: number) {
    const res = await fetch(`http://localhost:3000/api/v1/games/${game.id}/subjects?page=${page}`, {
      method: 'GET',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  async function fetchUpdateSubject(token: Token, subject: Subject) {
    const body = {
      subject: {
        'id': subject.id,
        'word': subject.word,
      }
    }
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${subject.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': "application/json",
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      },
      body: JSON.stringify(body)
    })
    return await res.json()
  }

  async function fetchDeleteSubject(token: Token, subject_id: number) {
    const res = await fetch(`http://localhost:3000/api/v1/subjects/${subject_id}`, {
      method: 'DELETE',
      headers: {
        'access-token': token.accessToken,
        'client': token.client,
        'uid': token.uid
      }
    })
    return await res.json()
  }

  if (pagination?.total_count == 0) {
    // When subjects don't exist after fetching subjects and pagination data
    return <p style={{textAlign: 'center', margin: '10rem auto'}}>Looks like you haven't created anything yet..?</p>
  } else if (currentSubjectList.length <= 0) {
    // When subjects don't exist before fetching subjects and pagination data
    return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
  } else {
    // When subjects exist
    const subjectComponents = currentSubjectList.map((s) => {
      return <TrSubjectMemo key={s.id} subject={s} handleClickEdit={handleClickEdit} handleClickDelete={handleClickDelete} />
    })
    return (
      <div className='game-edit-words'>
        {/* Modal */}
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <div className='modal-window-container'>
            <div className='modal-window-header'>
              Edit Word
            </div>
            <div className='modal-window-body'>
              <div className='form-group'>
                <label>Word</label>
                <div className='form-countable-input-group'>
                  <input ref={inputUpdateWordModalEl} value={inputUpdateWord} type='text' maxLength={game.char_count} onChange={e => setInputUpdateWord(e.target.value)} />
                  <div className='form-countable-input-counter'>{`${inputUpdateWord.length} / ${game.char_count}`}</div>
                </div>
                <div ref={divInvalidWordModaldEl} className='form-group-invalid-feedback'></div>
              </div>
            </div>
            <div className='modal-window-footer'>
              <button className='btn btn-primary' onClick={handleClickUpdate}>Update</button>
              <button className='btn btn-default' onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </Modal>
        {/* LoadingOverlay */}
        <LoadingOverlay showOverlay={showOverlay} />

        <table>
          <thead>
            <tr>
              <th className='table-th-word'>Word</th>
              <th className='table-th-date-edit'>Edit</th>
              <th className='table-th-date-delete'>Delete</th>
            </tr>
          </thead>
          <tbody>{ subjectComponents }</tbody>
        </table>
        {(() => {
          if (pagination && pagination.total_pages > 1) {
            return <PaginationComponent pagination={pagination} handleClickPage={handleClickPage} />
          }
        })()}
      </div>
    )
  }
}

export default EditWords
