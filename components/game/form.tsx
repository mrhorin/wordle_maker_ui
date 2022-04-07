import type { Game } from '../../types/global'

interface Props {
  game: Game,
  setGame: React.Dispatch<React.SetStateAction<Game>>,
  handleClickSubmit: VoidFunction,
  children?: JSX.Element
}

const defaultGame: Game = {
  title: '',
  desc: '',
  lang: 'en',
  char_count: 5,
}

const GameForm = (props: Props) => {

  function handleGameForm(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void{
    const nextGame: Game = {
      title: props.game.title,
      desc: props.game.desc,
      lang: props.game.lang,
      char_count: props.game.char_count,
      id: props.game.id,
      user_id: props.game.user_id,
    }
    if (event.target.id == 'game-title') nextGame.title = event.target.value
    if (event.target.id == 'game-desc') nextGame.desc = event.target.value
    if (event.target.id == 'game-lang') nextGame.lang = event.target.value
    if (event.target.id == 'game-charcount') nextGame.char_count = Number(event.target.value)
    props.setGame(nextGame)
  }

  return (
    <form id='game-form' onSubmit={e => e.preventDefault()}>
      {/* Title */}
      <div className='form-group'>
        <label>Title</label>
        <div className='form-countable-input-group'>
          <input type='text' id='game-title' maxLength={100} value={props.game.title} onChange={e => handleGameForm(e)} />
          <div className='form-countable-input-counter'>{`${props.game.title.length} / 100`}</div>
        </div>
        <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
      </div>
      {/* Description */}
      <div className='form-group'>
        <label>Description</label>
        <div className='form-countable-input-group'>
          <textarea id='game-desc' rows={3} maxLength={200} value={props.game.desc} onChange={e => handleGameForm(e)} />
          <div className='form-countable-input-counter'>{`${props.game.desc.length} / 200`}</div>
        </div>
        <div id='game-title-invalid-feedback' className='form-group-invalid-feedback'></div>
      </div>
      {/* Languagge */}
      <div className='form-group'>
        <label>Language</label>
        <select id='game-lang' value={props.game.lang} onChange={e => handleGameForm(e)}>
          <option value='en'>English</option>
          <option value='ja'>Japanese</option>
        </select>
      </div>
      {/* Character count */}
      <div className='form-group'>
        <label>Character count</label>
        <select id='game-charcount' value={props.game.char_count} onChange={e => handleGameForm(e)}>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='4'>4</option>
          <option value='5'>5</option>
          <option value='6'>6</option>
          <option value='7'>7</option>
          <option value='8'>8</option>
          <option value='9'>9</option>
          <option value='10'>10</option>
        </select>
      </div>
      {/* Submit */}
      <button type='button' id='game-submit' className='btn btn-defalt' onClick={props.handleClickSubmit}>Submit</button>
      { props.children }
    </form>
  )
}

export default GameForm
