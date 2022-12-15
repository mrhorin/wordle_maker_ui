import type { Game } from 'types/global'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useLocale from 'hooks/useLocale'

import ReactLoading from 'react-loading'
import SlideoutMenu from 'components/slideout_menu'
import GameIndexItem from 'components/game_index_item'

import Link from 'next/link'
import Image from 'next/image'

import cookie from 'scripts/cookie'
import { getGames, getPvRanking } from 'scripts/api'

type Rank = {
  rank: number,
  game: Game
}

type GameRankingItemProps = {
  rank: Rank
}

const GameRankingItem = (props: GameRankingItemProps) => {
  return (
    <div className='game-ranking-item'>
      <div className='game-ranking-item-rank'>
        { props.rank.rank }
      </div>
      <div className='game-ranking-item-title'>
        <Link href={{ pathname: '/games/[id]', query: { id: props.rank.game.id } }}>
          <a>{props.rank.game.title}</a>
        </Link>
      </div>
    </div>
  )
}

const Index = () => {
  const [games, setGames] = useState<Game[] | null>(null)
  const [ranks, setRanks] = useState<Rank[] | null>(null)
  const router = useRouter()
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

  useEffect(() => {
    getPvRanking().then(json => {
      if (json.ok) {
        setRanks(json.data as Rank[])
      } else {
        setRanks([])
      }
    }).catch(error => {
      console.log(error)
      setRanks([])
    })
  }, [])

  function GameIndex(): JSX.Element{
    if (games && games.length > 0) {
      const gameComponents: JSX.Element[] = games.map((game: Game, index: number) => {
        const titleElement: JSX.Element = <Link href={{
          pathname: '/games/[id]',
          query: { id: game.id }
        }}><a>{ game.title }</a></Link>
        return <GameIndexItem game={game} key={index} titleElement={titleElement} />
      })
      return <>{gameComponents}</>
    } else if (games == null) {
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else {
      return <p style={{ textAlign: 'center', margin: '10rem auto' }}>{t.INDEX.NO_GAME}</p>
    }
  }

  function GameRanking(): JSX.Element{
    if (ranks && ranks.length > 0) {
      const rankComponents: JSX.Element[] = ranks.map((rank: Rank, index: number) => {
        return <GameRankingItem rank={rank} key={index} />
      })
      return <div className='game-ranking'>{rankComponents}</div>
    } else if (ranks == null) {
      return <ReactLoading type={'spin'} color={'#008eff'} height={'25px'} width={'25px'} className='loading-center' />
    } else {
      return <p style={{ textAlign: 'center', margin: '10rem auto' }}>{t.INDEX.NO_GAME}</p>
    }
  }

  function handleClickCreateGameBtn(): void {
    if (cookie.client.loadUser()) {
      router.push("/mygames/create")
    } else {
      router.push("/signin")
    }
  }

  return (
    <main id='main'>
      <SlideoutMenu />

      <div className='index-board'>
        <div className='container'>
          {/* App Name */}
          <div className='index-board-title'>
            {t.APP_NAME}
          </div>
          {/* App Desc */}
          <div className='index-board-desc'>
            <div>{t.APP_DESC.FIRST_LINE}</div>
            <div>{t.APP_DESC.SECOND_LINE}</div>
          </div>
          {/* Create Game */}
          <div className='index-board-create'>
            <div className='btn-grad1' >
              <div className='btn-grad2' onClick={handleClickCreateGameBtn}>
                {t.INDEX.CREATE_GAME}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container'>
        <div className='index-games-container'>
          <div className='index-games-col7'>
            {/* The Latest Games */}
            <div className='index-title'>
              <div className='index-title-icon'>
                <Image src='/icons/svg/new.svg' width={42} height={23} alt={'New'} />
              </div>
              <div className='index-title-text'>
                {t.INDEX.LATEST_GAMES}
              </div>
            </div>
            <div className='game-index'>
              <GameIndex />
            </div>
          </div>
          {/* Weekly Ranking */}
          <div className='index-games-col3'>
            {/* The Latest Games */}
            <div className='index-title'>
              <div className='index-title-icon'>
                <Image src='/icons/svg/crown.svg' width={25} height={23} alt={'Weekly Ranking'} />
              </div>
              <div className='index-title-text'>
                {t.INDEX.WEEKLY_RANKING}
              </div>
            </div>
            <GameRanking />
          </div>
        </div>
      </div>
    </main>
  )
}

export default Index
