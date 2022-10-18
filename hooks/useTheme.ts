import type { Theme } from 'types/global'

export default () => {
  const defaultTheme: Theme = 'dark'

  function getSystemTheme(): Theme | null{
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return null
  }

  function setTheme(theme: Theme): void{
    document.documentElement.setAttribute("data-theme", theme)
  }

  return { defaultTheme, getSystemTheme, setTheme }
}