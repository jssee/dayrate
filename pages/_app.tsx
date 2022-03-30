import { AppPropsType } from "next/dist/shared/lib/utils";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppPropsType) {
  return <Component {...pageProps} />;
}
