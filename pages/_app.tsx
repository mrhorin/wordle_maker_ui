import type { AppContext, AppProps } from 'next/app'
import Router from 'next/router'
import Script from 'next/script'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import nprogress from 'nprogress'
import nookies from 'nookies'
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
  containerStyle: { textAlign: 'center', zIndex: 100 },
}

nprogress.configure({ showSpinner: false, speed: 400, minimum: 0.25 })
Router.events.on('routeChangeStart', nprogress.start)
Router.events.on('routeChangeError', nprogress.done)
Router.events.on('routeChangeComplete', nprogress.done)

function MyApp({ Component, pageProps }: AppProps) {
  function GTMScript(): JSX.Element{
    if (process.env.NEXT_PUBLIC_ENV == 'production') {
      return (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WJZVLVN');
          `
          }}
        />
      )
    }
    return <></>
  }

  return (
    <AlertProvider template={AlertTemplate} {...alertOptions}>
      {/* Google Tag Manager */}
      <GTMScript />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AlertProvider>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const { ctx, Component } = appContext
  const cookies = nookies.get(ctx)
  // Redirect to suitable locale page if cookies have locale key
  if (cookies.locale && cookies.locale != ctx.locale && ctx.res) {
    ctx.res.writeHead(307, { Location: `/${cookies.locale}${ctx.asPath}` })
    ctx.res.end()
  }
  const pageContext = { ...ctx }
  const pageProps = Component.getInitialProps ? await Component.getInitialProps(pageContext) : {}
  return { pageProps };
}

export default MyApp