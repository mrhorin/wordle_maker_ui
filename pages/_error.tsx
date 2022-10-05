import { NextPageContext } from 'next';
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

interface Props {
	statusCode?: number;
}

function Error({ statusCode }: Props): JSX.Element {
  const { t } = useLocale()

  return (
    <main id='main'>
      <Head>
        <title>`${statusCode} | {t.APP_NAME}`</title>
        <meta name="description" content={t.ERROR.DESC} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <h1>500</h1>
        <p>
          {statusCode
            ? `${statusCode}: ${t.ERROR.DESC}`
            : t.ERROR.DESC}
        </p>
      </div>
    </main>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
