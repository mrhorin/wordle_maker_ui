import type { NextPage } from 'next'
import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from 'components/slideout_menu'


const Home: NextPage = () => {
  const { t } = useLocale()

  return (
    <main id='main'>
      <div className='container'>
        <Head>
          <title>{t.APP_NAME}</title>
          <meta name="description" content={t.APP_DESC} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <SlideoutMenu />

        <h1 className='title'>
          Home
        </h1>
      </div>
    </main>
  )
}

export default Home
