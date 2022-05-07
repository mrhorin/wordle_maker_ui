import { memo } from 'react'
import { Tile } from 'types/global'

interface Props{
  tile: Tile,
}

const Tile = ({ tile }: Props) => {
  let style = 'words-row-tile'
  if (tile.isCorrect) style += ' words-row-tile-correct'
  if (tile.isPresent) style += ' words-row-tile-present'
  if (tile.isAbsent) style += ' words-row-tile-absent'
  return <div className={style}>{tile.letter}</div>
}

export default memo(Tile, (prevProps, nextProps) => {
  return prevProps.tile.letter == nextProps.tile.letter &&
    prevProps.tile.isCorrect == nextProps.tile.isCorrect &&
    prevProps.tile.isPresent == nextProps.tile.isPresent &&
    prevProps.tile.isAbsent == nextProps.tile.isAbsent
})