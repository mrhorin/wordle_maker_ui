import type { NextPage } from 'next'

import Navbar from './navbar'
import Footer from './footer'


const Layout: NextPage = ({ children }) => {

  return (
    <div className='wrap'>
      <Navbar />

      {children}

      <Footer />
    </div>
  )

}

export default Layout