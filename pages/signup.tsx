import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import styles from '../styles/Signup.module.css'

const Signup: NextPage = () => {

  return (
    <main className='main'>
      <div className='container'>
        <Head>
          <title>Signup | WORDLE MAKER APP</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <h1 className='title'>Signup.tsx</h1>

        <form method="get" action='http://localhost:3000/api/v1/auth/twitter?callback_url=http%3A%2F%2Flocalhost%3A3000%2Fsignup'>
          <button>[GET]Twitterでログイン</button>
        </form>

      </div>
    </main>
  )

}

export default Signup