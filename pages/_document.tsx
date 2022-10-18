import type { Theme } from 'types/global'
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'
import useTheme from 'hooks/useTheme'

import nookies from 'nookies'

type Props = {
  theme: string,
}

class MyDocument extends Document<Props> {

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx)
    const cookies = nookies.get(ctx)
    const { defaultTheme } = useTheme()
    const theme: Theme = cookies.theme as Theme || defaultTheme
    return { ...initialProps, theme }
  }

  render() {
    const theme = this.props.theme
    return (
      <Html data-theme={theme}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument