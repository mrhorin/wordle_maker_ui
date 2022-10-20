import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useMemo } from 'react'
import useLocale from 'hooks/useLocale'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import SlideoutMenu from 'components/slideout_menu'

import Link from 'next/link'

const Signin: NextPage = () => {
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  const { t } = useLocale()

  const handleChangeConfirmation = useMemo(() => {
    return () => { setCheckedConfirmation(!checkedConfirmation) }
  }, [checkedConfirmation])

  return (
    <main id='main'>
      <div className='container'>
        <Head>
          <title>{t.SIGN_IN.TITLE} | {t.APP_NAME}</title>
        </Head>

        <SlideoutMenu />

        <div className='signin text'>
          <h1 className='signin-title'>{t.SIGN_IN.TITLE}</h1>
          {/* TOS */}
          <div className='signin-tos'>
            サインインする前に必ず<Link href="/tos" shallow={true}><a>{t.TOS.TITLE}</a></Link>をご確認ください。
          </div>
          {/* agreement */}
          <div className='signin-agreement agreement' onClick={handleChangeConfirmation}>
            <input className='checkbox-default agreement-checkbox' type="checkbox" checked={checkedConfirmation} onChange={handleChangeConfirmation} />
            <span className='agreement-text'>{ t.SIGN_IN.I_AGREED}</span>
          </div>
          {/* Sign in buttons */}
          <div className='signin-btns'>
            {/* Twitter */}
            <form className='signin-form' method="post" action={`${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/twitter`}>
              <button className='btn btn-default btn-signin' style={{ background: '#1e9bf0', color: '#fff' }} disabled={!checkedConfirmation}>
                <FontAwesomeIcon icon={faTwitter} style={{marginRight: '1rem'}} />
                {t.SIGN_IN.CONTINUE.TWITTER}
              </button>
            </form>
          </div>
        </div>

      </div>
    </main>
  )
}

export default Signin