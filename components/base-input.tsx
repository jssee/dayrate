import * as React from "react";

import styles from "./base-input.module.css";

interface Props {
  label?: string;
}

export default function(props: Props): React.ReactElement<React.FC> {
  return (
    <div>
      <input
        type="text"
        className={styles.input}
        inputMode="numeric"
        pattern="[0-9]*"
        id={props.label}
      />
      <button type="submit" className={styles.button}>
        {" "}
        go
      </button>
    </div>
  );
}
