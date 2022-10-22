interface Props {
  checked: boolean,
  handleClick(): void,
  label?: string,
  text?: string,
}

const Checkbox = ({ checked, handleClick, label, text }: Props) => {

  function Label(): JSX.Element{
    if (label) return <label className='checkbox-label'>{label}</label>
    return <></>
  }

  function Text(): JSX.Element{
    if (text) return <div className='checkbox-input-group-text'>{text}</div>
    return <></>
  }

  return (
    <div className='checkbox-group'>
      <Label />
      <div className='checkbox-input-group' onClick={handleClick}>
        <input className="checkbox-default" type="checkbox" checked={checked} onChange={handleClick} />
        <Text />
      </div>
    </div>
  )
}

export default Checkbox