import Head from 'next/head'
import useLocale from 'hooks/useLocale'

export default function Custom404() {
  const { t } = useLocale()

  return (
    <main id='main'>
      <Head>
        <title>{`${ t.NOT_FOUND.TITLE } | ${ t.APP_NAME }`}</title>
        <meta name="description" content={t.NOT_FOUND.DESC} />
      </Head>

      <div className='container'>
        <div className='text'>
          <h1>{ t.NOT_FOUND.TITLE }</h1>
          <p>{ t.NOT_FOUND.DESC }</p>
        </div>
      </div>
    </main>
  )
}