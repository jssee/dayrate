# Day-rate formula

The calculator estimates the day rate needed to reach a desired annual salary after accounting for bonus, benefits, time off, and non-billable work. It assumes 365 days per year, 104 weekend days, and eight billable hours per day. Intermediate values retain their full precision, while the final day rate is rounded up to a practical quoting increment.

## Terms

| Symbol | Meaning |
| --- | --- |
| $S$ | Desired annual salary before personal taxes |
| $b$ | Bonus percentage as a decimal |
| $e$ | Benefits percentage as a decimal |
| $H$ | Holidays per year |
| $K$ | Sick or contingency days per year |
| $u$ | Non-billable time as a decimal |
| $C$ | Annual compensation target |
| $D$ | Estimated billable days per year |
| $r_{raw}$ | Unrounded day rate |
| $q$ | Quoting increment |
| $r$ | Quoted day rate |
| $r_h$ | Equivalent hourly rate |

## Formula

$$
C=S(1+b+e)
$$

$$
D=(365-104-H-K)(1-u)
$$

$$
r_{raw}=\frac{C}{D}
$$

$$
r=q\left\lceil\frac{r_{raw}}{q}\right\rceil
$$

For a five-dollar quoting increment, $q=5$. The equivalent hourly rate is:

$$
r_h=\frac{r}{8}
$$
