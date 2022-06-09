import type { AppProps } from 'next/app'
import Router from 'next/router'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import nprogress from 'nprogress'
import 'styles/globals.scss'
import 'nprogress/nprogress.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import Layout from 'components/layout'

const alertOptions = {
  position: positions.TOP_CENTER,
  timeout: 2000,
  offset: '0px',
  transition: transitions.SCALE,
  containerStyle: { textAlign: 'center', zIndex: 100 }
}

nprogress.configure({ showSpinner: false, speed: 400, minimum: 0.25 })
Router.events.on('routeChangeStart', nprogress.start)
Router.events.on('routeChangeError', nprogress.done)
Router.events.on('routeChangeComplete', nprogress.done)

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AlertProvider template={AlertTemplate} {...alertOptions}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AlertProvider>
  )
}

