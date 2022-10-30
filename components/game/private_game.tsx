import type { Game } from 'types/global'
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from 'components/slideout_menu'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

type Props = {
  game: Game,
}

const PrivateGame = (props: Props) => {
  const { t, locale } = useLocale()

  return (
    <main id='main'>
      <Head>
        <title>{`${props.game.title} | ${t.APP_NAME}`}</title>
        <meta name="description" content={props.game.desc ? props.game.desc : t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div className='games-private text'>
          <div className='games-private-msg'>
            <FontAwesomeIcon icon={faLock} />
            このゲームは現在非公開です
          </div>
          {/* title */}
          <div className='games-private-title'>
            <div className='games-private-label'>{t.GAME.TITLE}:</div>
            <div className='games-private-text'>{props.game.title}</div>
          </div>
          {/* desc */}
          <div className='games-private-desc'>
            <div className='games-private-label'>{t.GAME.DESC}:</div>
            <div className='games-private-text'>{props.game.desc}</div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PrivateGame