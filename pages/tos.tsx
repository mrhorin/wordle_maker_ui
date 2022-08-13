import Head from 'next/head'
import useLocale from 'hooks/useLocale'

import SlideoutMenu from 'components/slideout_menu'

const Tos = () => {
  const { t } = useLocale()

  return (
    <main id='main'>
      <Head>
        <title>{t.TOS.TITLE} | {t.APP_NAME}</title>
        <meta name="description" content={t.APP_DESC} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SlideoutMenu />

      <div className='container'>
        <div className='text'>
          <h1>{t.TOS.TITLE}</h1>
          <div style={{textAlign: 'right'}}>最終変更日: 2022年7月16日</div>
          <p>
            この利用規約（以下、「本規約」という。）は、このウェブサイトの管理者（以下、「管理者」という。）がこのウェブサイト上で提供するサービス（以下、「本サービス」という。）の利用条件を定めるものです。
            ユーザーの皆さまには、本規約に従って、本サービスをご利用いただきます。
          </p>

          <h2>第1条（適用）</h2>
          <ol>
            <li>本規約は、ユーザーと管理者との間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
            <li>管理者は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」という。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li>
            <li>本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。</li>
          </ol>

          <h2>第2条（利用登録及び認証）</h2>
          <ol>
            <li>
              本サービスにおいては、登録希望者が本規約に同意の上、登録希望者が選択したTwitter、Facebook、Googleのうちのいずれかの外部サービス（以下、「外部サービス」という。）
              上に保存されている登録希望者の情報への本サービスによるアクセスを許可し、本サービスがその外部サービス上に保存されている情報を取得し、
              管理者の管理するサーバー上のデータベース（以下、「DB」という。）に保存することによって、利用登録が完了するものとします。
            </li>
            <li>登録希望者が本サービスに利用登録をする際に、外部サービス上に保存されている登録希望者の情報のうち、本サービスは以下の情報を必要に応じてDBに保存するものとします。</li>
            <ul>
              <li>外部サービス名</li>
              <li>ユニークID、もしくは管理者がそれに相当するものと判断した情報</li>
              <li>ユーザー名、もしくは管理者がそれに相当するものと判断した情報</li>
              <li>ニックネーム、もしくは管理者がそれに相当するものと判断した情報</li>
              <li>プロフィール画像のURL、もしくは管理者がそれに相当するものと判断した情報</li>
            </ul>
            <li>利用登録の際にDBに保存したユーザーの情報（以下、「登録情報」という。）は、本サービスの一環として、不特定多数のユーザーに対し表示、閲覧可能な状態になる場合があります。</li>
            <li>管理者は、登録希望者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。</li>
            <ul>
              <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
              <li>本規約に違反したことがある者からの申請である場合</li>
              <li>その他、法令及び公序良俗と照らし合わせて管理者が利用登録を相当でないと判断した場合</li>
            </ul>
            <li>
              利用登録が完了すると、本サービスによりアクセストークンが発行され、登録情報及びアクセストークンは
              自動的にユーザーの利用するウェブブラウザ上のローカルストレージ、またはCookieに保存するものとします。
            </li>
            <li>
              本サービスでは、ユーザーが認証を必要とするページもしくはデータへアクセスし閲覧または変更または削除する際に、
              ローカルストレージまたはCookieに保存された登録情報及びアクセストークンをDBに保存された情報と照合することによってユーザーを認証し、
              この認証によってユーザー自身による利用とみなし、該当ページ及びデータの閲覧または変更または削除を許可するものとします。
            </li>
            <li>
              Cookieの有効期限切れ、もしくはアクセストークンが無効になる、もしくはユーザーがアクセストークンを紛失した場合、
              ユーザーが再度サインアップページより外部サービスへの本サービスによるアクセスを許可することによって、本サービスは新たなアクセストークンを発行するものとします。
            </li>
          </ol>

          <h2>第3条（登録情報及びアクセストークンの管理）</h2>
          <ol>
            <li>ユーザーは、自己の責任において、登録情報及びアクセストークンを適切に管理するものとします。</li>
            <li>ユーザーは、いかなる場合にも、登録情報とアクセストークンを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
            <li>
              ユーザーが利用登録時に選択した外部サービス上に保存されているユーザーの情報へのアクセス権を失う、もしくは外部サービスのサービス終了や仕様変更、その他何らかの理由により、
              本サービスが外部サービス上に保存されているユーザーの情報にアクセスできない場合、もしくは何らかの理由で本規約の第2条の2で定めた外部サービス上の「ユニークID、
              もしくは管理者がそれに相当するものと判断した情報」（以下、「ユニークID」という。）が利用登録時にDBに保存したユニークIDと相違する場合、
              ユーザーを認証することができなくなってしまう為、本サービスはセキュリティ上の観点から新たにアクセストークンを発行しないものとし、
              認証が必要なページ及びデータへのアクセスも許可しないものとします。
            </li>
            <li>セキュリティ上の安全を確保するため、アクセストークンには一定の有効期限を設定する場合があり、有効期限が切れた場合、そのアクセストークンは無効になるものとします。</li>
            <li>登録情報及びアクセストークンが第三者によって使用されたことによって生じた損害は、管理者は一切の責任を負わないものとします。</li>
            <li>管理者は、以下の事由に該当すると判断した場合、ユーザーに事前に告知することなく登録情報を削除、または変更する場合があり、その理由については一切の開示義務を負わないものとします。</li>
            <ul>
              <li>登録情報に虚偽がある場合</li>
              <li>本規約に違反したユーザーである場合</li>
              <li>本サービスが終了する場合</li>
              <li>その他、法令及び公序良俗と照らし合わせて管理者が登録情報を削除、または変更する必要があると判断した場合</li>
            </ul>
          </ol>

          <h2>第4条（権利帰属）</h2>
          <ol>
            <li>ユーザーが本サービスに投稿、その他何らかの方法で送信したデータ（以下、「投稿データ」という。）の著作権を含む知的財産権は、管理者に帰属するものとします。</li>
            <li>ユーザーは投稿データについて、管理者及び管理者から権利を承継しまたは許諾された者に対して著作者人格権を行使しないものとします。</li>
            <li>ユーザーは投稿データについて、知的財産権の侵害、その他不当な権利侵害がないものを投稿するものとします。</li>
            <li>
              投稿データに知的財産権の侵害、
              もしくは投稿データやその投稿データを投稿したユーザーが「第5条（禁止事項）」で定めるいずれかの行為に該当する場合、
              そのデータを投稿したユーザー自身が損害賠償責任を負うものとします。
            </li>
          </ol>

          <h2>第5条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ol>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>管理者、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスによって得られた情報を商業的に利用する行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
            <li>本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>管理者が許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>面識のない異性との出会いを目的とした行為</li>
            <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、管理者が不適切と判断する行為</li>
          </ol>

          <h2>第6条（本サービスの提供の停止等）</h2>
          <ol>
            <li>管理者は以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</li>
            <ul>
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、管理者が本サービスの提供が困難と判断した場合</li>
            </ul>
            <li>管理者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
          </ol>

          <h2>第7条（利用制限及び登録抹消）</h2>
          <ol>
            <li>
              管理者は、ユーザーが「第5条（禁止事項）」で示した行為、もしくは以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、
              またはユーザーとしての登録を抹消することができるものとします。
            </li>
            <ul>
              <li>本規約のいずれかの条項に違反した場合</li>
              <li>登録事項に虚偽の事実があることが判明した場合</li>
              <li>管理者からの連絡に対し、一定期間返答がない場合</li>
              <li>本サービスについて、最終の利用から一定期間利用がない場合</li>
              <li>その他、管理者が本サービスの利用を適当でないと判断した場合</li>
            </ul>
            <li>管理者は、本条に基づき管理者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
          </ol>

          <h2>第8条（退会）</h2>
          <p>ユーザーは、管理者の定める退会手続により、本サービスから退会できるものとします。</p>

          <h2>第9条（保証の否認及び免責事項）</h2>
          <ol>
            <li>
              管理者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）
              がないことを明示的にも黙示的にも保証しておりません。
            </li>
            <li>
              管理者は、本サービスに起因してユーザーに生じたあらゆる損害について、管理者の故意又は重過失による場合を除き、一切の責任を負いません。
            </li>
          </ol>

          <h2>第10条（サービス内容の変更等）</h2>
          <p>管理者は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。</p>

          <h2>第11条（利用規約の変更）</h2>
          <ol>
            <li>管理者は本規約を変更できるものとします。</li>
            <li>本規約に変更があった場合、管理者はユーザーに対しては現在ご覧になっている「利用規約」のページにて通知し、本規約の変更があった日付を「最終変更日」の欄にて通知するものとします。</li>
            <li>当該変更内容の通知後、ユーザーが本サービスを利用した場合、ユーザーは本規約の変更に同意したものとみなします。</li>
          </ol>

          <h2>第12条（権利義務の譲渡の禁止）</h2>
          <p>ユーザーは，管理者の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。</p>

          <h2>第13条（準拠法・裁判管轄）</h2>
          <ol>
            <li>本規約の解釈にあたっては，日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には，大阪地方裁判所を専属的合意管轄とします。</li>
          </ol>

          <p>以上</p>
        </div>
      </div>
    </main>
  )

}

export default Tos