import type { Token, Game, Subject, Pagination } from 'types/global'
import { useEffect, useState, useContext } from 'react'
import ReactLoading from 'react-loading'
import nprogress from 'nprogress'

import PaginationComponent from 'components/pagination'

import CurrentTokenContext from 'contexts/current_token'

import validate from 'scripts/validate'

interface Props {
  game: Game
}

const EditWords = ({ game }: Props) => {
  /*
   * currentSubjects:
   *  A list of subjects. */
  const [currentSubjects, setCurrentSubjects] = useState<Subject[]>([])
  /* currentSubjectsPagination:
   *  Pagenation for subjects.  */
  const [currentSubjectsPagination, setCurrentSubjectsPagination] = useState<Pagination>()

  /********* Context *********/
  const currentTokenContext = useContext(CurrentTokenContext)

  useEffect(() => {
    // When Edit Words tab is selected at first, it fetches the first page of subjects
    if (currentSubjects.length <= 0 && validate.token(currentTokenContext.currentToken)) {
      nprogress.start()
      fetchSubjects(currentTokenContext.currentToken, 1).then(json => {
        if (json.ok) {
          setCurrentSubjects(json.data.subjects)
          setCurrentSubjectsPagination(json.data.pagination)
        }
      }).finally(() => nprogress.done())
    }
  }, [])

  function handleClickPage(page: number): void{
    if (validate.token(currentTokenContext.currentToken)) {
      nprogress.start()
      fetchSubjects(currentTokenContext.currentToken, page).then(json => {
        if (json.ok) {
          setCurrentSubjects(json.data.subjects)
          setCurrentSubjectsPagination(json.data.pagination)
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

  if (currentSubjectsPagination?.total_count == 0) {
    return <p style={{textAlign: 'center', margin: '10rem auto'}}>Looks like you haven't created anything yet..?</p>
  } else if (currentSubjects.length <= 0) {
    return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
  } else {
    const subjectComponents = currentSubjects.map((s, i) => {
      return (
        <tr key={i}>
          <td className='table-td-word'>{ s.word }</td>
          <td className='table-td-edit'>
            <button className='btn btn-mini btn-square btn-secondary'>Edit</button>
          </td>
          <td className='table-td-delete'>
            <button className='btn btn-mini btn-square btn-danger'>Delete</button>
          </td>
        </tr>
      )
    })
    return (
      <div className='game-edit-words'>
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
          if (currentSubjectsPagination) {
            return <PaginationComponent pagination={currentSubjectsPagination} handleClickPage={handleClickPage} />
          }
        })()}
      </div>
    )
  }
}

export default EditWords
