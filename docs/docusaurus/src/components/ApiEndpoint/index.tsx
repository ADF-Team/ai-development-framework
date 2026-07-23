import React, {type JSX} from 'react';
import styles from './styles.module.css';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Props {
  method: Method;
  path: string;
}

export default function ApiEndpoint({method, path}: Props): JSX.Element {
  return (
    <div className={styles.endpoint}>
      <span className={`${styles.method} ${styles[method.toLowerCase()]}`}>
        {method}
      </span>
      <code className={styles.path}>{path}</code>
    </div>
  );
}
