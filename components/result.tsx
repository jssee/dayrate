import * as React from "react";

import { targetSalary, workingDays } from "../utils/formulas";

interface Props {
  result: {};
}

export default function ({ result }: Props): React.ReactElement {
  return (
    <div>
      <p>Your day rate is:</p>
      <p>
        {Math.round(
          targetSalary(net, bonus, benefits) /
            workingDays(holidays, sickdays, nonBillableTime)
        )}
      </p>
      <p>
        {`That's about ${Math.round(
          targetSalary(net, bonus, benefits) /
            workingDays(holidays, sickdays, nonBillableTime) /
            8
        )} an hour`}
      </p>
    </div>
  );
}
