interface Props {
  handleChange(event: React.ChangeEvent<HTMLSelectElement>): void,
  label?: string,
  id?: string,
  value?: number | string,
  defaultValue?: string,
  children?: JSX.Element | JSX.Element[],
}

const Select = ({handleChange, label, id, value, defaultValue, children}: Props) => {
  function Label(): JSX.Element{
    if (label) return <label className='select-label'>{label}</label>
    return <></>
  }

  return (
    <div className='select-group'>
      <Label />
      <select className='select-default' id={id} onChange={e => handleChange(e)} value={value} defaultValue={defaultValue}>
       {children}
      </select>
    </div>

  )
}

export default Select