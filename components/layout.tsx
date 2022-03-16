import type { NextPage } from 'next'

import Header from './header'
import Footer from './footer'


const Layout: NextPage = ({ children }) => {

  return (
    <div className='wrap'>
      <Header />

      {children}

      <Footer />
    </div>
  )

}

export default Layout