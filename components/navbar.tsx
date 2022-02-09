import type { NextPage } from 'next'
import Link from 'next/link'

const Navbar: NextPage = () => {
  return (
    <nav className='navbar'>
      <div className='container'>
        <Link href="/">
          <a>HOME</a>
        </Link>
        <Link href="/signup">
          <a>SIGNUP</a>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar