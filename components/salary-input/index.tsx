import * as React from "react";

import styles from "./input.module.css";

interface Props {
  label: string;
  for: string;
}

export default function(props: Props): React.ReactElement<React.FC> {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={props.label}>
        {props.label}
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={props.label}
        />
      </label>
    </div>
  );
}
