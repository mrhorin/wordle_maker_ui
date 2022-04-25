import type { Token, Game, Subject, Pagination } from 'types/global'
import { useEffect, useState, useRef, useContext, useCallback, memo } from 'react'
import { useAlert } from 'react-alert'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'

import PaginationComponent from 'components/pagination'
import LoadingOverlay from 'components/loading_overlay'

import CurrentTokenContext from 'contexts/current_token'

import validate from 'scripts/validate'

interface TrSubjectProps {
  subject: Subject
  handleClickDelete(subject_id: number): void
}

const TrSubjectMemo = memo(({ subject, handleClickDelete }: TrSubjectProps) => {
  return (
    <tr>
      <td className='table-td-word'>{ subject.word }</td>
      <td className='table-td-edit'>
        <button className='btn btn-mini btn-square btn-secondary'>Edit</button>
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
  /* showOverLay:
   *  A flag indicates whether LoadingOverlay component is shown or not. */
  const [showOverlay, setShowOverlay] = useState<boolean>(false)

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

  const alert = useAlert()

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

  const removeSubject = useCallback((id: number) => {
    setCurrentSubjectList(prevCuurentSubjectList => {
      return prevCuurentSubjectList.filter((prevSubject) => {
        return prevSubject.id !== id
      })
    })
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
      return <TrSubjectMemo key={s.id} subject={s} handleClickDelete={handleClickDelete} />
    })
    return (
      <div className='game-edit-words'>
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
