import { memo } from 'react'

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </div>
    </footer>
  )
}

export default memo(Footer)
