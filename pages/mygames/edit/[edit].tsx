import type { UserInfo, Token, Game } from '../../../types/global'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState, useLayoutEffect, useContext } from 'react'
import Head from 'next/head'

import Sidemenu from '../../../components/sidemenu'

import CurrentTokenContext from '../../../contexts/current_token'
import CurrentUserInfoContext from '../../../contexts/current_user_info'

import validate from '../../../validate'

import Link from 'next/link'

type Props = {
  token: Token,
  userInfo: UserInfo
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
// }

const MygamesEdit = (props: Props) => {
  return (
    <main id='main'>
    <Head>
      <title>Edit | My Games | WORDLE MAKER APP</title>
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