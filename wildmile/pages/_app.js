import "@mantine/core/styles.css"
import Head from 'next/head'
import { MantineProvider, AppShell, createTheme } from '@mantine/core'
import { HeaderNav } from '/components/nav'
import Footer from '../components/footer'

const theme = createTheme({
  /** Put your mantine theme override here */
})

export default function App(props) {
  const { Component, pageProps } = props

  return (
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={theme}
      >
     <AppShell>
      <Head>
        <title>Urban River Management Page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

       <AppShell.Header>
          <HeaderNav />
        </AppShell.Header>

        <Component {...pageProps} />

        <AppShell.Footer>
          <Footer />
        </AppShell.Footer>
    </AppShell>
      </MantineProvider>
  )
}