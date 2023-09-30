import Head from 'next/head'
import { HeaderNav } from '../components/nav'
import { MantineProvider, AppShell } from '@mantine/core'
import Footer from '../components/footer'


export default function App(props) {
  const { Component, pageProps } = props

  return (
    <>
      <Head>
        <title>Urban River Management Page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
          fontFamily: 'Onset, sans-serif',
        }}
      >
        <AppShell
          header={
            <HeaderNav />
          }
          footer={
            <Footer />
          }
        >
          <Component {...pageProps} />

        </AppShell>
      </MantineProvider>
    </>
  )
}