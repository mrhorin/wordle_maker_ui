import Image from 'next/image'
import { useContext, memo } from 'react'

import CurrentTokenContext from 'contexts/current_token'

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </div>
    </footer>
  )
}

export default memo(Footer)
