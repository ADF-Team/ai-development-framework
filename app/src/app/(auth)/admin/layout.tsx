// 管理者用画面（(auth)/adminグループ）共通レイアウト
// TODO: インフラ（Cloud SQL）準備後、getCurrentUser()でロール判定し、管理者以外は/projectsへリダイレクトする
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
