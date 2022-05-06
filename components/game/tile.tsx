import { memo } from 'react'

interface Props{
  letter: string
}

const Tile = ({ letter }: Props) => {
  return <div className='words-row-tile'>{letter}</div>
}

export default  memo(Tile)