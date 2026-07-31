// システム管理者用画面（(auth)/systemグループ）共通レイアウト
// TODO: インフラ（Cloud SQL）準備後、getCurrentUser()でロール判定し、システム管理者以外は/projectsへリダイレクトする
export default function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
