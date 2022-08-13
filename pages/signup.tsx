import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useMemo } from 'react'
import useLocale from 'hooks/useLocale'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import SlideoutMenu from 'components/slideout_menu'

import Link from 'next/link'

const Signup: NextPage = () => {
  const [checkedTosAgreement, setCheckedTosAgreement] = useState<boolean>(false)
  const { t } = useLocale()

  const handleCheckedTosAgreement = useMemo(() => {
    return () => { setCheckedTosAgreement(!checkedTosAgreement) }
  }, [checkedTosAgreement])

  return (
    <main id='main'>
      <div className='container'>
        <Head>
          <title>{t.SIGN_UP.TITLE} | {t.APP_NAME}</title>
          <meta name="description" content={t.APP_DESC} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <SlideoutMenu />

        <h1 className='title'>{t.SIGN_UP.TITLE}</h1>
        <p>
          <Link href="/tos" shallow={true}>
            <a target="_blank">{t.TOS.TITLE}</a>
          </Link>
        </p>

        <form method="post" action='http://localhost:3000/api/v1/auth/twitter'>
          {/* tos_agreement */}
          <div className='form-group-checkbox' style={{ marginBottom: '1rem' }}>
            <label onClick={handleCheckedTosAgreement}>{t.SIGN_UP.I_AGREED}</label>
            <input type="checkbox" id="tos_agreement" checked={checkedTosAgreement} onChange={handleCheckedTosAgreement} />
          </div>
          <button className='btn btn-default' disabled={!checkedTosAgreement}>
            <FontAwesomeIcon icon={faTwitter} style={{marginRight: '1rem'}} />
            {t.SIGN_UP.CONTINUE.TWITTER}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Signup