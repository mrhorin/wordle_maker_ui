import type { Pagination } from 'types/global'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'

interface Props {
  page: Pagination,
  handleClickPage(page: number): void
}

const Kaminari = ({ page, handleClickPage }: Props) => {
  const pageComponents: JSX.Element[] = []

  if (page.total_pages > 1) {
    // Prev
    if (page.current_page > 1) {
      const prevPage = page.current_page - 1
      pageComponents.push(
        <button key={0} className='kaminari-page' onClick={() => handleClickPage(prevPage)}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
      )
    }
    // Numbers
    for (let i = 1; page.total_pages >= i; i++){
      let style: string = 'kaminari-page'
      if (page.current_page == i) style += ' kaminari-page-current'
      pageComponents.push(<button key={i} className={style} onClick={() => handleClickPage(i)}>{i}</button>)
    }
    // Next
    if (page.current_page < page.total_pages) {
      const nextPage = page.current_page + 1
      pageComponents.push(
        <button key={page.total_pages + 1} className='kaminari-page' onClick={() => handleClickPage(nextPage)}>
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      )
    }
  }

  return <div className='kaminari'>{pageComponents}</div>
}

export default Kaminari
