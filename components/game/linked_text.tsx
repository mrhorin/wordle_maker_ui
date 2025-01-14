import reactStringReplace from 'react-string-replace'

interface Props{
  text: string,
  enableLink?: boolean,
}

// textに含まれるURLを外部リンク化して表示
const LinkedText = ({ text, enableLink = false }: Props) => {

  function extractDomain(url: string): string{
    const domain: RegExpMatchArray | null = url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)
    return domain ? domain[1] : ""
  }

  if (enableLink) {
    return (
      <>
        {reactStringReplace(text, /(https?:\/\/[\w/:%#\$&\?~\.=\+\-]+)/g, (match, i) => (
          <a key={i} href={match} target="_blank" rel="noreferrer">{extractDomain(match)}</a>
        ))}
      </>
    )
  }
  return (
    <>
      {reactStringReplace(text, /(https?:\/\/[\w/:%#\$&\?~\.=\+\-]+)/g, (match, i) => (
        <span key={i}>{extractDomain(match)}</span>
      ))}
    </>
  )
}

export default LinkedText