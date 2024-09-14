import { memo } from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
        <Link
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
        </Link>
      </div>
    </footer>
  )
}

export default memo(Footer)
