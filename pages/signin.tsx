import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useMemo } from 'react'

import useOauth from 'hooks/useOauth'
import useLocale from 'hooks/useLocale'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import Checkbox from 'components/form/checkbox'

import Link from 'next/link'

const Signin: NextPage = () => {
  /********** State **********/
  const [checkedConfirmation, setCheckedConfirmation] = useState<boolean>(false)
  /********** Hook ***********/
  const oauth = useOauth()
  const { t } = useLocale()

  const handleClickConfirmation = useMemo(() => {
    return () => { setCheckedConfirmation(!checkedConfirmation) }
  }, [checkedConfirmation])

  return (
    <main id='main'>
      <div className='container'>
        <Head>
          <title>{`${t.SIGN_IN.TITLE} | ${t.APP_NAME}`}</title>
        </Head>

        <div className='signin text'>
          <h1 className='signin-title'>{t.SIGN_IN.TITLE}</h1>
          {/* TOS */}
          <div className='signin-tos'>
            {t.SIGN_IN.TOS_TEXT.A}
            <Link href="/tos" shallow={true}>{t.TOS.TITLE}</Link>
            {t.SIGN_IN.TOS_TEXT.B}
          </div>
          {/* agreement */}
          <div className='signin-agreement'>
            <Checkbox checked={checkedConfirmation} handleClick={handleClickConfirmation} text={t.SIGN_IN.I_AGREED} />
          </div>
          {/* Sign in buttons */}
          <div className='signin-btns'>
            {/* Twitter */}
            <button className='btn btn-signin-tw' disabled={!checkedConfirmation} onClick={() => oauth.twitter()}>
              <FontAwesomeIcon icon={faTwitter} />
              {t.SIGN_IN.CONTINUE.TWITTER}
            </button>
          </div>
        </div>

      </div>
    </main>
  )
}

export default Signin