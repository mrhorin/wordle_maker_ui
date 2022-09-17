import type { Game } from 'types/global'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from 'components/slideout_menu'
import GameIndexItem from 'components/game_index_item'

import Link from 'next/link'
import Image from 'next/image'

type Props = {
  games: Game[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`${process.env.API_PROTOCOL}://${process.env.API_DOMAIN}/api/v1/games/`)
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
        <meta name="description" content={t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='index-board'>
        <div className='container'>
          <div className='index-board-title'>
            {t.APP_NAME}
          </div>
          <div className='index-board-desc'>
            <div>{t.APP_DESC.FIRST_LINE}</div>
            <div>{t.APP_DESC.SECOND_LINE}</div>
          </div>
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
          <div className='index-title-icon'>
            <Image src='/new.svg' width={40} height={25} alt={'New'} />
          </div>
          <div className='index-title-text'>
            {t.INDEX.LATEST_GAMES}
          </div>
        </div>
        <div className='game-index'>
          {gameComponents}
        </div>
      </div>
    </main>
  )
}

export default Index
