export const messages = {
  common: {
    brand: 'ADF',
    brandFullName: 'AI Development Framework',
    errorMessage: {
      unauthorized: '認証に失敗しました。',
      forbidden: '権限がありません。',
      notFound: 'リソースが見つかりません。',
      conflict: '競合が発生しました。',
      unprocessableEntity: '不正なリクエストです。',
      tooManyRequests:
        'リクエストが混み合っています。しばらくしてから再度お試しください。',
      internalServerError: 'サーバーエラーが発生しました。',
      badGateway:
        'AIの実行に失敗しました。しばらくしてから再度お試しください。',
      otherError: 'リクエストに失敗しました。',
      error: 'エラーが発生しました。',
    },
  },
  welcome: {
    headingLines: ['属人化から、', '標準化へ。'],
    descriptionLines: [
      'AIを活用した開発プロセスを、',
      '案件ごとに標準化するための社内ツールです。',
    ],
    loginButton: 'ログインへ進む',
  },
  stages: {
    stageNames: {
      requirements: '要件定義',
      design: '設計',
      implementation: '実装',
      review: 'レビュー',
      security: 'セキュリティ',
      test: 'テスト',
      documentation: 'ドキュメント',
    },
  },
  nav: {
    projects: '案件一覧',
    adminTemplates: 'テンプレート管理',
    adminUsers: 'ユーザー管理',
    userRoleAdmin: '管理者',
    logout: 'ログアウト',
  },
  projects: {
    title: '案件一覧',
    newProjectButton: '新規案件作成',
    createdAtLabel: '作成日：',
    overallStatusLabel: {
      inProgress: '進行中',
      completed: '完了',
    },
  },
  auth: {
    back: '戻る',
    loginGreeting: 'AI Development Framework にログイン',
    email: 'メールアドレス',
    emailPlaceholder: 'you@company.com',
    password: 'パスワード',
    passwordPlaceholder: '••••••••',
    loginButton: 'ログイン',
    forgotPasswordLink: 'パスワードをお忘れですか？',
    forgotPasswordEmailRequired: 'メールアドレスを入力してください。',
    forgotPasswordSent: 'パスワード再設定用のメールを送信しました。',
    errorMessage: {
      invalidCredentials: 'メールアドレスまたはパスワードが正しくありません。',
      other: 'ログインに失敗しました。しばらくしてから再度お試しください。',
    },
    validation: {
      emailInvalid: 'メールアドレスの形式で入力してください。',
      passwordRequired: 'パスワードを入力してください。',
    },
  },
}
