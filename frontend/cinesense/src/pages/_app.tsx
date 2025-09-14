import type { AppProps } from "next/app";
import "../styles/globals.css";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* ใส่ Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Render หน้าเพจ */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
