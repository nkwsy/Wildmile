// import { Html, Main, NextScript } from "next/document";
// import "@mantine/core/styles/global.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

// import Hydration from "/lib/hydration"; // (c)

// import Head from "next/head";
import {
  MantineProvider,
  //   AppShell,
  ColorSchemeScript,
  createTheme,
  DirectionProvider,
} from "@mantine/core";

import { HeaderNav } from "/components/nav_bar";
// import Footer from "../components/footer";

export const metadata = {
  title: "Urban Rivers",
  description: "",
};

const theme = createTheme({
  /** Put your mantine theme override here */
  lineHeights: {
    xs: 0.7,
    sm: 1,
    md: 1.2,
    lg: 1.5,
    xl: 1.6,
  },
});

// import { WebVitals } from "./_components/web-vitals";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        {/* <WebVitals /> */}

        {/* <Hydration /> */}

        <MantineProvider theme={theme}>
          {/* <HeaderNav /> */}
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

// export default function RootLayout({ children }) {
//   //   const { Component, pageProps } = props;

//   return (
//     <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
//       <Html lang="en">
//         <Head>
//           <title>Urban River Management Page</title>
//           <meta
//             name="viewport"
//             content="minimum-scale=1, initial-scale=1, width=device-width"
//           />
//           <ColorSchemeScript defaultColorScheme="auto" />
//         </Head>
//         <body>
//           <AppShell>
//             <AppShell.Header>{/* <HeaderNav /> */}</AppShell.Header>
//             children
//             <AppShell.Footer>
//               <Footer />
//             </AppShell.Footer>
//           </AppShell>
//           <Main />
//           <NextScript />
//         </body>
//       </Html>
//     </MantineProvider>
//   );
// }
