import type { Game } from 'types/global'
import { useEffect, useState } from 'react'
import useLocale from 'hooks/useLocale'

import Head from 'next/head'
import ReactLoading from 'react-loading'
import SlideoutMenu from 'components/slideout_menu'
import GameIndexItem from 'components/game_index_item'

import Link from 'next/link'
import Image from 'next/image'

import { getGames } from 'scripts/api'

const Index = () => {
  const [games, setGames] = useState<Game[] | null>(null)
  const { t } = useLocale()

  useEffect(() => {
    getGames().then(json => {
      if (json.ok) {
        setGames(json.data as Game[])
      } else {
        setGames([])
      }
    }).catch(error => {
      console.log(error)
      setGames([])
    })
  }, [])

  function createGameComponents(): JSX.Element[] | JSX.Element{
    if (games && games.length > 0) {
      return games.map((game: Game, index: number) => {
        return <GameIndexItem game={game} href={`/games/${game.id}`} key={index} />
      })
    } else if (games == null) {
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else {
      return <p style={{ textAlign: 'center', margin: '10rem auto' }}>{t.INDEX.NO_GAME}</p>
    }
  }

  return (
    <main id='main'>
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
            <Image src='/new.svg' width={42} height={23} alt={'New'} />
          </div>
          <div className='index-title-text'>
            {t.INDEX.LATEST_GAMES}
          </div>
        </div>
        <div className='game-index'>
          {createGameComponents()}
        </div>
      </div>
    </main>
  )
}

export default Index
