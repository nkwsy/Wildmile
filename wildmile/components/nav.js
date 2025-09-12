import {
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
  Center,
  rem,
} from "@mantine/core";
import { IconLogout, IconSettings, IconChevronDown } from "@tabler/icons-react";
import { Suspense, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useUser } from "../lib/hooks";
import { useRouter } from "next/navigation";
import getAvatar from "../lib/avatar.js";
import cx from "clsx";
import classes from "/styles/nav.module.css";

const nav_tabs = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Trash",
    link: "/trash",
    subitems: [
      {
        label: "New Log",
        link: "/trash/log",
      },
      {
        label: "History",
        link: "/trash/history",
      },
    ],
  },
  {
    label: "Plants",
    link: "/plants",
    subitems: [
      {
        label: "Species List",
        link: "/plants/species",
      },
      {
        label: "Add an Observation",
        link: "/plants/observe",
      },
    ],
  },
  // Subitems for projects need seeding somehow
  {
    label: "Projects",
    link: "/projects",
  },
];

async function DesktopHeaderMenu() {
  // const session =  await getSession();
  const { user, loading, mutate }  = useUser();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const router = useRouter();
  let photoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
    getAvatar(user && user.profile ? user.profile.name : "default")
  )}`;

  async function handleLogout() {
    await fetch("/api/logout");
    mutate({ user: null });
    router.push("/");
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return (
      <>
                  <Link href="/login">
                    <Button variant="default">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign up</Button>
                  </Link>
      </>
    )
  }

  return (
    <>
      <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: "pop-top-right" }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
            mt="0.5rem"
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, {
                  [classes.userActive]: userMenuOpened,
                })}
              >
                <Group spacing={7}>
                  <Avatar
                    src={photoSrc}
                    alt={
                      user.profile
                        ? user.profile.name || "Username"
                        : "Username"
                    }
                    radius="xl"
                    size={40}
                  />
                  <Text fw={500} size="sm" lh={1} mr={3}>
                    {user.profile
                      ? user.profile.name || "Username"
                      : "Username"}
                  </Text>
                  <IconChevronDown size={15} stroke={2.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Link href="/profile">
                <Menu.Item
                  icon={<IconSettings size="0.8rem" stroke={1.5} />}
                >
                  Account settings
                </Menu.Item>
              </Link>
              <Menu.Item
                icon={<IconLogout size="0.9rem" stroke={1.5} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          </>
  );
}

async function MobileHeaderMenu() {
  const { user, loading, mutate } = useUser();
  if (loading) {
    return <Text>Loading...</Text>;
  }
  const items = nav_tabs.map((link) => {
    const menuItems = link.subitems?.map((item) => (
      <Menu.Item key={item.label}>
        <Link href={item.link} className={classes.subLink}>
          {item.label}
        </Link>
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <Link href={link.link} className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={15} stroke={2.5} />
              </Center>
            </Link>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Link key={link.label} href={link.link} className={classes.link}>
        {link.label}
      </Link>
    );
  });
  if (!user) {
    return (
      <>
        <Link href="/login">
          <Button variant="default">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </>
    );
  }
  return items;
}

export function HeaderNav() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  // const { classes, theme, cx } = useStyles()
  // const { user, loading, mutate }  = useUser();

  return (
    <Box pb={10}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Urban River Logo"
                h="3.8rem"
                w="auto"
                mt="0.5rem"
                mb="-1rem"
              />
            </Link>

          <Group
            h="100%"
            mt="1rem"
            gap={0}
            visibleFrom="sm"
            className={classes.hiddenMobile}
          >
            <Suspense>
              <MobileHeaderMenu />
            </Suspense>
          </Group>

          <Group className={classes.hiddenMobile}>
            <Suspense>
              <DesktopHeaderMenu />
            </Suspense>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          />
        </Group>
      </header>

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
          <Divider my="sm" color={"dark"} />

          <Suspense>
            <MobileHeaderMenu />
          </Suspense>


          <Divider my="sm" color={"dark"} />

          {/* <Group position="center" grow pb="xl" px="md">
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group> */}
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
