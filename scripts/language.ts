import type { Word } from 'types/global'

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
    if (this.lang == 'ja') return '日本語(カタカナ)'
    return ''
  }

  public get succeedMsg(): string{
    if (this.lang == 'en') return 'SUCCEED'
    if (this.lang == 'ja') return '成功しました'
    return ''
  }

  public get failedMsg(): string{
    if (this.lang == 'en') return 'FAILED'
    if (this.lang == 'ja') return '失敗しました'
    return ''
  }

  public get updatedMsg(): string{
    if (this.lang == 'en') return 'UPDATED'
    if (this.lang == 'ja') return '更新しました'
    return ''
  }

  public get savedMsg(): string{
    if (this.lang == 'en') return 'SAVED'
    if (this.lang == 'ja') return '保存しました'
    return ''
  }

  public getInvalidMsg(charCount: string | number): string{
    if (this.lang == 'en') return `Must be unique and ${charCount} characters in English`
    if (this.lang == 'ja') return `${this.name}、${charCount}文字で一意の値を入力して下さい`
    return ''
  }

  public validateWord(word: string): boolean{
    const ptn: RegExp | null = this.regexp
    if(ptn == null) return false
    return ptn.test(word)
  }
}

export default Language