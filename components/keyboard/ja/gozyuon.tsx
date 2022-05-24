import { useState } from 'react'
import Key from 'components/keyboard/en/key'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackspace } from '@fortawesome/free-solid-svg-icons'

const KeyMode = {
  Normal: 'NORMAL',
  SmallDaku: 'SMALL_DAKU',
} as const

type KeyMode = typeof KeyMode[keyof typeof KeyMode]

interface Props{
  handleOnClick(key: string): void
}

const Gozyuon = ({ handleOnClick }: Props) => {
  const [keyMode, setKeyMode] = useState<KeyMode>(KeyMode.Normal)
  const NORMAL_LETTERS_TABLE: string[][] = [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', 'ユ', 'ヨ'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', 'ヲ', 'ン'],
  ]
  const DAKU_SMALL_LETTERS_TABLE: string[][] = [
    ['ァ', 'ィ', 'ゥ', 'ェ', 'ォ'],
    ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
    ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
    ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
    ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
    ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
    ['ャ', 'ュ', 'ョ'],
    ['ッ'],
    ['ー'],
  ]

  const lettersTable: string[][] = keyMode == KeyMode.Normal ? NORMAL_LETTERS_TABLE : DAKU_SMALL_LETTERS_TABLE
  const lettersColComponents: JSX.Element[] = lettersTable.map((letters, index) => {
    const keys: JSX.Element[] = letters.map((l) => {
      return <Key key={l} letter={l} type={'CHARACTER'} status={'EMPTY'} handleOnClick = { handleOnClick } />
    })
    return <div key={`col-${index}`} className='col'>{keys}</div>
  })

  const keyModeComponent: JSX.Element = keyMode == KeyMode.Normal ?
    <Key key={'小字゛゜'} letter={'小字゛゜'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={() => setKeyMode(KeyMode.SmallDaku)} style={{ fontSize: '0.8rem', width: '19%' }} /> :
    <Key key={'通常'} letter={'通常'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={() => setKeyMode(KeyMode.Normal)} style={{fontSize: '0.8rem', width: '19%'}}/>

  return (
    <div className='keyboard-ja-gozyuon'>
      <div className='modifier-keys'>
        {keyModeComponent}
        <Key key={'Backspace'} letter={'Backspace'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={handleOnClick} style={{width: '9%'}}>
          <FontAwesomeIcon icon={faBackspace}/>
        </Key>
        <Key key={'Enter'} letter={'Enter'} type={'MODIFIER'} status={'ABSENT'} handleOnClick={handleOnClick} style={{width: '19%'}}/>
      </div>
      <div className='character-keys'>
        {lettersColComponents}
      </div>
    </div>
  )
}

export default Gozyuon