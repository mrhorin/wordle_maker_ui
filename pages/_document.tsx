import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

import nookies from 'nookies'

type Props = {
  theme: string,
}

function MyDocument(props: Props) {

  function GTMNoscript(): JSX.Element{
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

  return (
    <Html data-theme={props.theme}>
      <Head />
      <body>
        {/* Google Tag Manager (noscript) */}
        <GTMNoscript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps: DocumentInitialProps = await Document.getInitialProps(ctx)
  const cookies = nookies.get(ctx)
  const theme = cookies.theme || process.env.NEXT_PUBLIC_DEFAULT_THEME
  return { ...initialProps, theme }
}

export default MyDocument