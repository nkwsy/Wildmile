import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
// import '@mantine/modals/styles.css';
// import '@mantine/form/styles.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
// import { HeaderNav } from '../components/nav'
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';

// import Footer from '../components/footer'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Head>
        <title>Mantine Template</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </MantineProvider>
  );
}

// export default function App({ Component, pageProps }: AppProps) {
//     return (
//     <MantineProvider theme={theme}>
//       <Head>
//       <Component {...pageProps} />
//       </Head>
//     </MantineProvider>
//   );
// }

//   return (
    
//     <MantineProvider theme={theme}>
//       <AppShell
//           // header={
//           //   <HeaderNav />
//           // }
//           // footer={
//           //   <Footer />
//           // }
//         >
//       <Component {...pageProps}/>
//       </AppShell>
//     </MantineProvider>);
// }

// export default function App(props) {
//   const { Component, pageProps } = props

//   return (
//     <>
//       <Head>
//         <title>Urban River Management Page</title>
//         <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
//       </Head>

//       <MantineProvider
//         theme={{
//           /** Put your mantine theme override here */
//           colorScheme: 'light',
//         }}
//       >
//         <AppShell
//           header={
//             <HeaderNav />
//           }
//           footer={
//             <Footer />
//           }
//         >
//           <Component {...pageProps} />

//         </AppShell>
//       </MantineProvider>
//     </>
//   )
// }