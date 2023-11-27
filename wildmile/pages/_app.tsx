import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
// import '@mantine/modals/styles.css';
// import '@mantine/form/styles.css';
import { AppProps } from 'next/app';
import Head from 'next/head'
import { HeaderNav } from '../components/nav'
import { MantineProvider,createTheme, ColorSchemeScript, AppShell } from '@mantine/core'
import Footer from '../components/footer'


const theme = createTheme({
fontFamily: `Greycliff CF`
});

export default function App({ Component, pageProps }: AppProps) {
    // return (<MantineProvider >
    return (
    
    <MantineProvider theme={theme}>
      <AppShell
          // header={
          //   <HeaderNav />
          // }
          // footer={
          //   <Footer />
          // }
        >
      <Component {...pageProps}/>
      </AppShell>
    </MantineProvider>);
}

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