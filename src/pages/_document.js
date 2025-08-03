import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/speakly.png" type="image/png" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/speakly.png" />
        <!-- Optionally, add more icon sizes for broader support -->
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
