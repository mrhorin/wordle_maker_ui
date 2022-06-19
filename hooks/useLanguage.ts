import Language from 'scripts/language'

// useLanguage
export default (lang: string): Language => {
  const language: Language = new Language(lang)

  return language
}
