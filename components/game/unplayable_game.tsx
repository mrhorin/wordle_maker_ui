import type { Game } from 'types/global'
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from 'components/slideout_menu'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

type Props = {
  game: Game,
  isPrivate: boolean,
  hasNoWords: boolean,
}

const UnplayableGame = (props: Props) => {
  const { t, locale } = useLocale()

  function message(): string{
    if (props.isPrivate) return t.GAMES.UNPLAYABLE_GAME.MESSAGE.PRIVATE
    return t.GAMES.UNPLAYABLE_GAME.MESSAGE.NO_WORDS
  }

  return (
    <main id='main'>
      <Head>
        <title>{`${props.game.title} | ${t.APP_NAME}`}</title>
        <meta name="description" content={props.game.desc ? props.game.desc : t.APP_DESC.FIRST_LINE + t.APP_DESC.SECOND_LINE} />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div className='games-private text'>
          {/* message */}
          <div className='games-private-msg'>
            <FontAwesomeIcon icon={faLock} />
            {message()}
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

export default UnplayableGame