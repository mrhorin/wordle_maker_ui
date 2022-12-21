import type { Game } from 'types/global'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'
import { UrlObject } from 'url'

import Link from 'next/link'

type Props = {
  game: Game,
  href: UrlObject
}

const GameIndexItem = (props: Props) => {
  const { t } = useLocale()

  function Title(): JSX.Element{
    if (props.game.is_suspended) {
      // When suspended
      return (
        <div className='game-index-item-title'>
          <span className='game-index-item-title-lock'>{props.game.title}</span>
        </div>
      )
    } else if (!props.game.is_published) {
      return(
        <div className='game-index-item-title'>
          <FontAwesomeIcon icon={faLock} />
          <div className='game-index-item-title-text'>{props.game.title}</div>
        </div>
      )
    }else {
      return <div className='game-index-item-title'>{props.game.title}</div>
    }
  }

  function Desc(): JSX.Element{
    if (props.game.is_suspended) {
      return <div className='game-index-item-desc'>{t.MY_GAMES.EDIT.INDEX.SUSPENDED_GAME}</div>
    } else {
      return <div className='game-index-item-desc'>{props.game.desc}</div>
    }
  }

  return (
    <div className='game-index-item'>
      <Link href={props.href}>
        <a>
          {/* Title */}
          <Title />
          {/* Description */}
          <Desc />
          <div className='game-index-item-attrs'>
            {/* Language */}
            <div className='game-index-item-attrs-item'>
              <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.LANGUAGE }</div>
              <div className='game-index-item-attrs-item-value'>{props.game.lang == 'ja' ? t.LANG.JA : t.LANG.EN}</div>
            </div>
            {/* Words count */}
            <div className='game-index-item-attrs-item'>
              <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.WORD_COUNT }</div>
              <div className='game-index-item-attrs-item-value'>{props.game.words_count}</div>
            </div>
            {/* Character count */}
            <div className='game-index-item-attrs-item'>
              <div className='game-index-item-attrs-item-label'>{ t.GAME_IDEX.CHARACTER_COUNT }</div>
              <div className='game-index-item-attrs-item-value'>{props.game.char_count}</div>
            </div>
            {/* Challenge count */}
            <div className='game-index-item-attrs-item'>
              <div className='game-index-item-attrs-item-label'>{ t.GAME.CHALLENGE_COUNT }</div>
              <div className='game-index-item-attrs-item-value'>{props.game.challenge_count}</div>
            </div>
          </div>
        </a>
      </Link>
    </div>
  )
}

export default GameIndexItem
