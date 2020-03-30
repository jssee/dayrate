import { AppPropsType } from "next/dist/next-server/lib/utils";

import "../public/global.css";

export default function MyApp({ Component, pageProps }: AppPropsType) {
  return <Component {...pageProps} />;
}
