interface Props {
  checked: boolean,
  handleClick(): void,
  text?: string,
  label?: string,
  id?: string,
}

const Checkbox = ({ checked, handleClick, label, text, id }: Props) => {

  function getAriaLabel(): string{
    if (text) return text
    if (label) return label
    return ""
  }

  function Label(): JSX.Element{
    if (label) return <label htmlFor={id} className='checkbox-label'>{label}</label>
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
        <input id={id} aria-label={getAriaLabel()} className="checkbox-default" type="checkbox" checked={checked} onChange={handleClick} />
        <Text />
      </div>
    </div>
  )
}

export default Checkbox