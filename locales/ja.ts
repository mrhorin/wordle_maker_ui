export default {
  APP_NAME: 'Makele β',
  APP_DESC: {
    FIRST_LINE: "好きなワードでオリジナルWordleが作れる",
    SECOND_LINE: "日本語/英語にも対応、文字数設定も自由"
  },
  COMMON: {
    COPY: 'コピー',
    WORD: 'ワード',
    WORDS: 'ワード',
    EDIT: '編集',
    DELETE: '削除',
    CLOSE: '閉じる',
    LIGHT: 'ライト',
    DARK: 'ダーク',
  },
  ALERT: {
    SIGN_OUT: 'サインアウトしました',
    SUCCESS: '成功しました',
    FAILED: '失敗しました',
    CREATED: '作成しました',
    UPDATED: '更新しました',
    SAVED: '保存しました',
    DELETED: '削除しました',
    COPIED: 'コピーしました',
    ADDED_INVALID_WORDS: 'カタカナ*文字で一意の値を入力して下さい',
    NOT_IN_WORD_LIST: '登録されていないワード',
    NOT_ENOUGH_LETTERS: '文字数がたりません',
    FIINISHED_GAME: 'ゲームは終了しています',
    CURRENT_USER_SUSPENDED: '凍結されています',
    YOU_ARE_NOT_SIGNED_IN: 'サインインしていません',
  },
  API: {
    FAILED: 'データの取得に失敗しました',
  },
  VALIDATE: {
    GAME: {
      TITLE: {
        REQUIRED: '必須項目です',
        CHARS_OR_LESS: '100文字以下にしてください',
      }
    }
  },
  HEADER: {
    SIGN_IN: 'Sign In',
    ACCOUNT: {
      EDIT_GAMES: '編集',
      CREATE_A_GAME: '新規作成',
      ACCOUNT: 'アカウント',
      SIGN_OUT: 'サインアウト'
    },
  },
  SLIDEOUT_MENU: {
    HOME: 'ホーム',
    TERMS: '利用規約',
    HOW_TO_PLAY: '遊び方',
    LANGUAGE: 'Language',
    THEME: {
      THEME: 'テーマ',
      SYSTEM: 'システム',
      LIGHT: 'ライト',
      DARK: 'ダーク',
    },
  },
  SIDE_MENU: {
    MY_GAMES: 'マイゲーム',
    EDIT: '編集',
    CREATE: '新規作成',
    SETTINGS: '設定',
    ACCOUNT: 'アカウント'
  },
  MY_GAMES: {
    TITLE: 'マイゲーム',
    CREATE: {
      TITLE: '新規作成'
    },
    EDIT: {
      TITLE: '編集',
      INDEX: {
        NO_GAME: "編集するゲームはありません。",
        SUSPENDED_ACCOUNT: "このアカウントは現在凍結されています。",
        SUSPENDED_GAME: "このゲームは現在凍結されています。",
      },
      TABS: {
        SETTINGS: '設定',
        ADD_WORDS: 'ワード追加',
        EDIT_WORDS: 'ワード一覧',
        DELETE_GAME: 'ゲーム削除',
      },
      SETTINGS: {
        GAME_LINK: 'リンク',
      },
      ADD_WORDS: {
        LABEL: "追加ワード",
        CANNOT_ADD_DUPLICATED_WORDS: "登録済みのワードと重複するワードは登録できません",
        WILL_TURN_RED: "無効なワードを入力すると赤色で表示されます",
      },
      EDIT_WORDS: {
        SORT: {
          ALPHABET_ASC: '名前: 昇順',
          ALPHABET_DESC: '名前: 降順',
          NEWEST_ASC: '追加日: 昇順',
          NEWEST_DESC: '追加日: 降順',
        },
        DELETE_CHECKED_WORDS: '選択したワードを削除',
        SAVE_CSV: 'CSV形式で保存',
      },
      DELETE_GAME: {
        BUTTON: 'このゲームを削除',
        MESSAGE: {
          SURE: 'ゲーム削除',
          WILL_BE_DELETED: 'このゲームは削除されます。',
          CANNOT_RECOVER: "削除したゲームは元に戻すことはできません。",
          CANNOT_REPlY: "削除した場合、一切の問い合わせ等にはお答えしかねます。",
        }
      }
    },
  },
  SETTINGS: {
    ACCOUNT: {
      TITLE: 'アカウント',
      DELETE_ACCOUNT: {
        BUTTON: 'アカウントを削除',
        MESSAGE: {
          SURE: 'アカウント削除',
          WILL_BE_DELETED: 'アカウントと、アカウントに関連するデータはすべて削除されます。',
          CANNOT_RECOVER: "削除したデータは元に戻すことはできません。",
          CANNOT_REPlY: "削除した場合、一切の問い合わせ等にはお答えしかねます。",
        }
      }
    }
  },
  INDEX: {
    CREATE_GAME: '作ってみる',
    LATEST_GAMES: '新着',
    WEEKLY_RANKING: '週間ランキング',
    NO_GAME: 'ゲームがありません。',
  },
  GAMES: {
    HOW_TO_PLAY: {
      TITLE: '遊び方',
      BASIC_RULES: '基本ルール',
      EXAMPLES: '例',
      RULE_1: '隠されたワードを推理するゲームです',
      RULE_2: '文字と、文字の位置の両方が正しい場合は青色になります',
      RULE_3: '文字は合っていても、文字の位置が間違っている場合は黄色になります',
      RULE_4: 'すべて青色にできればクリアです!',
    },
    RESULT: {
      ANSWER: '今日の答え',
      PLAYED: 'プレイ回数',
      WIN: '勝率 %',
      CURRENT_STREAK: '連勝中',
      MAX_STREAK: '連勝記録',
      GAME_TIME: '思考時間',
      NEXT_GAME: '次のゲームまで',
    },
    UNPLAYABLE_GAME: {
      MESSAGE: {
        PRIVATE: 'このゲームは現在、作成者によって非公開になっています',
        NO_WORDS: 'このゲームは現在、遊ぶことができません',
      }
    },
  },
  SIGN_IN: {
    TITLE: 'サインイン',
    TOS_TEXT: {
      A: 'サインインする前に必ず',
      B: 'をご確認下さい。'
    },
    I_AGREED: '利用規約に同意します',
    CONTINUE: {
      TWITTER: 'Twitterでサインイン',
      FACEBOOK: 'Facebookでサインイン',
      GOOGLE: 'Googleでサインイン',
    },
  },
  GAME_IDEX: {
    LANGUAGE: '言語',
    WORD_COUNT: '単語数',
    CHARACTER_COUNT: '文字数',
    CHALLENGE_COUNT: '最大回数',
  },
  TOS: {
    TITLE: '利用規約'
  },
  NOT_FOUND: {
    TITLE: '404 Not Found',
    DESC: "お探しのページは見つかりませんでした。",
  },
  ERROR: {
    TITLE: 'エラーページ',
    DESC: 'エラーが発生しました。',
  },
  FORM: {
    UPDATE: '更新',
    SUBMIT: '送信',
    CANCEL: 'キャンセル',
    I_AGREE: 'はい、同意しました',
    PUBLIC: '公開する',
    CHIP_TEXTAREA: {
      NOTE: '各ワードの後には,半角カンマを入力してください'
    },
  },
  GAME: {
    TITLE: 'タイトル',
    DESC: '説明',
    CHALLENGE_COUNT: '最大回数',
    CHARACTER_COUNT: '文字数',
    LANGUAGE: '言語',
    IS_PUBLISHED: '公開状態',
  },
  LANG: {
    EN: 'English',
    JA: '日本語',
  },
}
