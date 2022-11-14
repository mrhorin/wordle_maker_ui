import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'
import Script from 'next/script'

import nookies from 'nookies'

type Props = {
  theme: string,
}

class MyDocument extends Document<Props> {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx)
    const cookies = nookies.get(ctx)
    const theme = cookies.theme || process.env.NEXT_PUBLIC_DEFAULT_THEME
    return { ...initialProps, theme }
  }

  GTMScript(): JSX.Element{
    if (process.env.NEXT_PUBLIC_ENV == 'production') {
      return (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WJZVLVN');
          `}
        </Script>
      )
    }
    return <></>
  }

  GTMNoscript(): JSX.Element{
    if (process.env.NEXT_PUBLIC_ENV == 'production') {
      return (
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WJZVLVN" height="0" width="0" style="display:none;visibility:hidden">`,
          }}
        />
      )
    }
    return <></>
  }

  render() {
    const theme = this.props.theme
    return (
      <Html data-theme={theme}>
        <Head>
          {/* Google Tag Manager */}
          <this.GTMScript />
        </Head>
        <body>
          {/* Google Tag Manager (noscript) */}
          <this.GTMNoscript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument