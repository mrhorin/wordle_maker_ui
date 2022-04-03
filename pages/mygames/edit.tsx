import type { UserInfo, Token } from '../../types/global'
import { GetServerSideProps } from 'next'
import nookies from 'nookies'

import Head from 'next/head'

import Sidemenu from '../../components/sidemenu'


import validate from '../../validate'

type Props = {
  token: Token,
  userInfo: UserInfo
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = nookies.get(context)
  const token: Token = {
    accessToken: cookies['accessToken'],
    client: cookies['client'],
    uid: cookies['uid'],
    expiry: cookies['expiry'],
  }
  const userInfo: UserInfo = {
    provider: cookies['provider'],
    name: cookies['name'],
    nickname: cookies['nickname'],
    uid: cookies['uid'],
    image: cookies['image'],
  }
  const props: Props = {
    token: token,
    userInfo: userInfo
  }

  if (validate.token(props.token) && validate.userInfo(props.userInfo)) {
    return { props: props }
  } else {
    return {
      props: props,
      redirect: {
        statusCode: 302,
        destination: 'signup',
      }
    }
  }
}

const MygamesEdit = (props: Props) => {

  return (
    <main id='main'>
      <Head>
        <title>My Games | WORDLE MAKER APP</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='container'>
        <div id='sidemenu-container'>
          <Sidemenu activeMenu={'edit' }/>

          <div id='sidemenu-main'>
            <h1 className='title'>Edit games</h1>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MygamesEdit
