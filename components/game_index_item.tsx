import type { Game } from 'types/global'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

import useLocale from 'hooks/useLocale'

import Link from 'next/link'

type Props = {
  game: Game,
  href: string
}

const GameIndexItem = (props: Props) => {
  const { t } = useLocale()

  return (
    <div className='game-index-item'>
      {/* Title */}
      <div className='game-index-item-title'>
        {(() => {
          if (props.game.is_suspended) {
            return (
              <span className='game-index-item-title-lock'>🔒 {props.game.title}</span>
            )
          } else {
            return <Link href={props.href}><a>{props.game.title}</a></Link>
          }
        })()}
      </div>
      {/* Description */}
      <div className='game-index-item-desc'>
        {(() => {
          if (props.game.is_suspended) {
            return t.MY_GAMES.EDIT.INDEX.SUSPENDED_GAME
          } else {
            return props.game.desc
          }
        })()}
      </div>
      <div className='game-index-item-attrs'>
        {/* Character count */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME.CHARACTER_COUNT }:</div>
          <div className='game-index-item-attrs-item-value'>{props.game.char_count}</div>
        </div>
        {/* Language */}
        <div className='game-index-item-attrs-item'>
          <div className='game-index-item-attrs-item-label'>{ t.GAME.LANGUAGE }:</div>
          <div className='game-index-item-attrs-item-value'>{props.game.lang == 'ja' ? t.LANG.JA : t.LANG.EN}</div>
        </div>
      </div>
    </div>
  )
}

export default GameIndexItem
