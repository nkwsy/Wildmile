import {
  createStyles,
  Header,
  Image,
  Group,
  Button,
  Divider,
  Menu,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  Avatar,
  UnstyledButton,
  Text,
  rem,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react'
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link'
import { useUser } from '../lib/hooks'
import Router from 'next/router'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({ variant: 'filled', color: theme.primaryColor }).background,
  },

  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42),
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.white,
    borderRadius: theme.radius.sm,

    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

}));


let nav_tabs = []

export function setTabs(tabs) {
  nav_tabs = tabs
}

export function HeaderNav() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { classes, theme, cx } = useStyles();
  const [user, { mutate }] = useUser()

  let photoSrc = 'https://api.multiavatar.com/noname.png'


  if (user && user.profile) {
    if (user.profile.picture) {
      console.log(user.profile.picture)
    } else {
      photoSrc = 'https://api.multiavatar.com/' + user.profile.name + '.png'
    }
  }

  async function handleLogout() {
    await fetch('/api/logout')
    mutate({ user: null })
    Router.push('/')
  }

  return (
    <Box bp={10}>
      <Header height={60} px="md" className={classes.header}>
        <Group position="apart" sx={{ height: '100%' }}>
          {user && user ? <Link href='/home'>
            <Image src='/logo.png' alt='Urban River Logo' height='3.8rem' width='auto' />
          </Link> : <Link href='/'>
            <Image src='/logo.png' alt='Urban River Logo' height='3.8rem' width='auto' />
          </Link>}

          <Group sx={{ height: '100%' }} spacing={0} className={classes.hiddenMobile}>
            {nav_tabs.map((tab) => {
              return (<Link href={tab.href} className={classes.link}>
                {tab.name}
              </Link>)
            })}
          </Group>

          <Group className={classes.hiddenMobile}>
            {user && user ?
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  >
                    <Group spacing={7}>
                      <Avatar src={photoSrc} alt={user.profile ? user.profile.name || 'Username' : 'Username'} radius="xl" size={40} />
                      <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                      {user.profile ? user.profile.name || 'Username' : 'Username'}
                      </Text>
                      <IconChevronDown size={rem(12)} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Link href='/profile'>
                    <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />}>
                      Account settings
                    </Menu.Item>
                  </Link>
                  <Menu.Item icon={<IconLogout size="0.9rem" stroke={1.5} />} onClick={handleLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              : <>
                <Link href='/login'><Button variant="default">Log in</Button></Link>
                <Link href='/signup'><Button>Sign up</Button></Link>
              </>
            }
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
        </Group>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />


          {nav_tabs.map((tab) => {
            <Link href={tab.href} className={classes.link}>
              {tab.name}
            </Link>
          })}

          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />

          <Group position="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box >
  );
}