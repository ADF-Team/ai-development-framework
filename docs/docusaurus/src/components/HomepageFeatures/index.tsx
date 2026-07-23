import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  to: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '画面詳細',
    to: '/docs/screens/project-list',
    description: (
      <>案件一覧・案件詳細（工程別ワークスペース）・管理者画面など、各画面のURL・構成コンポーネント・使用APIをまとめています。</>
    ),
  },
  {
    title: 'API',
    to: '/docs/api',
    description: <>Next.js API Routesのエンドポイント仕様（リクエスト/レスポンス、認証方式など）をまとめています。</>,
  },
  {
    title: 'DB',
    to: '/docs/db',
    description: <>ER図とテーブル定義をまとめています。</>,
  },
  {
    title: 'インフラ',
    to: '/docs/infra',
    description: <>Cloud Run・Cloud SQL等のインフラ構成をまとめる予定です。</>,
  },
];

function Feature({title, to, description}: FeatureItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
