import { Locale } from 'types/global'
import { useRouter } from 'next/router'

import en from 'locales/en'
import ja from 'locales/ja'

export default () => {
  const router = useRouter()
  const { locale, pathname, asPath, query } = useRouter()
  const t = locale === "ja" ? ja : en

  const switchLocale = (nextLocale: Locale) => {
    router.push({ pathname, query }, asPath, { locale: nextLocale })
  }

  return {switchLocale, t, locale}
}