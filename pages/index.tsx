import type { Game } from 'types/global'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad} from '@fortawesome/free-solid-svg-icons'

import SlideoutMenu from 'components/slideout_menu'
import GameIndexItem from 'components/game_index_item'

import Link from 'next/link'

type Props = {
  games: Game[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch('http://api:3000/api/v1/games/')
  let games: Game[] = []
  if (res.status == 200) {
    const json = await res.json()
    if (json.ok) games = json.data as Game[]
  }
  return { props: { games: games } }
}

const Index = (props: Props) => {
  const { t } = useLocale()

  const gameComponents: JSX.Element[] = props.games.map((game: Game, index: number) => {
    return <GameIndexItem game={game} href={`/games/${game.id}`} key={index} />
  })

  return (
    <main id='main'>
      <Head>
        <title>{t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='index-board'>
        <div className='container'>
          <div className='index-board-title'>
            {t.APP_NAME}
          </div>
          <div className='index-board-desc'>{t.APP_DESC}</div>
          <div className='index-board-create'>
            <Link href="/mygames/create">
              <a>
                <button type='button' className='btn btn-accent1'>
                  {t.INDEX.CREATE_GAME}
                </button>
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div className='container'>
        {/* The Latest Games */}
        <div className='index-title'>
          <FontAwesomeIcon icon={faGamepad} />
          {t.INDEX.LATEST_GAMES}
        </div>
        <div className='game-index'>
          {gameComponents}
        </div>
      </div>
    </main>
  )
}

export default Index
