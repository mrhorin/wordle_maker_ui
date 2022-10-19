import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useMemo } from 'react'
import useLocale from 'hooks/useLocale'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import SlideoutMenu from 'components/slideout_menu'

import Link from 'next/link'

const Signin: NextPage = () => {
  const [checkedTosAgreement, setCheckedTosAgreement] = useState<boolean>(false)
  const { t } = useLocale()

  const handleCheckedTosAgreement = useMemo(() => {
    return () => { setCheckedTosAgreement(!checkedTosAgreement) }
  }, [checkedTosAgreement])

  return (
    <main id='main'>
      <div className='container'>
        <Head>
          <title>{t.SIGN_IN.TITLE} | {t.APP_NAME}</title>
        </Head>

        <SlideoutMenu />

        <div className='text'>
          <h1>{t.SIGN_IN.TITLE}</h1>
          {/* TOS */}
          <div style={{margin: '15rem 0 0.5rem 0'}}>
            <Link href="/tos" shallow={true}>
              <a>{t.TOS.TITLE}</a>
            </Link>
          </div>

          <form method="post" action={`${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/twitter`}>
            {/* tos_agreement */}
            <div className='agreement' onClick={handleCheckedTosAgreement}>
              <input id="tos_agreement" className='checkbox-default agreement-checkbox' type="checkbox" checked={checkedTosAgreement} onChange={handleCheckedTosAgreement} />
              <span className='agreement-text' style={{ fontWeight: '500'}}>{ t.SIGN_IN.I_AGREED}</span>
            </div>
            {/* buttons */}
            <div style={{ marginTop: '1rem' }}>
              <button className='btn btn-default btn-signin' style={{ background: '#1e9bf0', color: '#fff' }} disabled={!checkedTosAgreement}>
                <FontAwesomeIcon icon={faTwitter} style={{marginRight: '1rem'}} />
                {t.SIGN_IN.CONTINUE.TWITTER}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Signin