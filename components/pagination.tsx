import type { Pagination } from 'types/global'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'

interface Props {
  pagination: Pagination
  handleClickPage(page: number): void
}

const PaginationComponent = ({ pagination, handleClickPage }: Props) => {
  const pageComponents: JSX.Element[] = []

  if (pagination.total_pages > 1) {
    // Prev
    if (pagination.current_page > 1) {
      const prevPage = pagination.current_page - 1
      pageComponents.push(
        <button key={0} className='pagination-page' onClick={() => handleClickPage(prevPage)}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
      )
    }
    // Numbers
    for (let i = 1; pagination.total_pages >= i; i++){
      let style: string = 'pagination-page'
      if (pagination.current_page == i) style += ' pagination-page-current'
      pageComponents.push(<button key={i} className={style} onClick={() => handleClickPage(i)}>{i}</button>)
    }
    // Next
    if (pagination.current_page < pagination.total_pages) {
      const nextPage = pagination.current_page + 1
      pageComponents.push(
        <button key={pagination.total_pages + 1} className='pagination-page' onClick={() => handleClickPage(nextPage)}>
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      )
    }
  }

  return <div className='pagination'>{pageComponents}</div>
}

export default PaginationComponent
