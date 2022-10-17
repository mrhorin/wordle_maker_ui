import type { Theme } from 'types/global'

export default () => {

  function getSystemTheme(): Theme{
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    return 'dark'
  }

  function setTheme(theme: Theme): void{
    const dataTheme: Theme = theme == 'system' ? getSystemTheme() : theme as Theme
    document.documentElement.setAttribute("data-theme", dataTheme)
  }

  return { getSystemTheme, setTheme }
}