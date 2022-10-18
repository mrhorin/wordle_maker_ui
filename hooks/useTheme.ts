import type { Theme } from 'types/global'

export default () => {
  const defaultTheme: Theme = process.env.NEXT_PUBLIC_DEFAULT_THEME as Theme

  function getSystemTheme(): Theme | null{
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return null
  }

  function getTheme(): string | null{
    return document.documentElement.getAttribute("data-theme")
  }

  function setTheme(theme: Theme): void{
    document.documentElement.setAttribute("data-theme", theme)
  }

  return { defaultTheme, getSystemTheme, getTheme, setTheme }
}