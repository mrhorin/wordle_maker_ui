class Language{
  public readonly lang: string

  public constructor(lang: string) {
    this.lang = lang
  }

  public get regexp(): RegExp | null{
    if (this.lang == 'en') return new RegExp(/^[a-zA-Z]+$/, 'g')
    if (this.lang == 'ja') return new RegExp(/^[ァ-ンヴー]+$/, 'g')
    return null
  }

  public get name(): string {
    if (this.lang == 'en') return 'English'
    if (this.lang == 'ja') return '日本語（カタカナ）'
    return ''
  }

  public validateWord(word: string): boolean{
    const ptn: RegExp | null = this.regexp
    if(ptn == null) return false
    return ptn.test(word)
  }
}

export default Language
