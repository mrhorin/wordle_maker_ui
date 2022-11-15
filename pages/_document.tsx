import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

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
          <link rel="manifest" href="/manifest.json" />
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