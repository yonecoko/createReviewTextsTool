"use client";

import styles from "./highlightTextArea.module.css";

export default function CopyText() {
  return (
    <div>
      <div className={styles.wrightArea}>メモ帳</div>
      <textarea className={styles.copyTextarea} id="copyText" />
    </div>
  );
}
