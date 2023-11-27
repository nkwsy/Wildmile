import { Html, Head, Main, NextScript } from "next/document"
// import { createGetInitialProps } from "@mantine/next"
import { ColorSchemeScript } from '@mantine/core';
import HeaderNav from '../components/nav'

export default function Document() {
  return (
    <Html lang="en">
      <Head>  
        <ColorSchemeScript defaultColorScheme="auto" />
            <HeaderNav />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


// const getInitialProps = createGetInitialProps()

// function Document({ initialProps }) {
//   return (
//     <Html lang="en">
//       <Head />
//       <body>
//         <Main />
//         <NextScript />
//       </body>
//     </Html>
//   )
// }

// Document.getInitialProps = getInitialProps

// export default Document