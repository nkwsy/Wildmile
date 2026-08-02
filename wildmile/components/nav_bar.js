"use client";
import React, { useState } from "react";
import {
  Image,
  Group,
  Stack,
  Button,
  Divider,
  Menu,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  Avatar,
  UnstyledButton,
  NavLink,
  Text,
  Center,
  rem,
} from "@mantine/core";
import {
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconBriefcase,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useUser } from "../lib/hooks";
import { usePathname } from "next/navigation";
import cx from "clsx";
import classes from "styles/nav.module.css";
const nav_tabs = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Trash",
    link: "/trash",
    subitems: [
      { label: "Overview", link: "/trash" },
      { label: "New Log", link: "/trash/log" },
      { label: "History", link: "/trash/history" },
    ],
  },
  {
    label: "Plants",
    link: "/plants",
    subitems: [
      { label: "Overview", link: "/plants" },
      { label: "Species List", link: "/plants/species" },
    ],
  },
  {
    label: "Projects",
    link: "/projects",
  },
  {
    label: "Camera Traps",
    link: "/cameratrap",
    subitems: [
      { label: "Overview", link: "/cameratrap" },
      { label: "Identify", link: "/cameratrap/identify" },
      { label: "Explore", link: "/cameratrap/explore" },
      { label: "Wildlife Data", link: "/cameratrap/wildlife" },
      { label: "Project Data", link: "/cameratrap/analytics/total-images" },
    ],
  },
];

export function HeaderNav({ children }) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { user, loading, mutate } = useUser();
  const pathname = usePathname();

  let photoSrc = "https://api.multiavatar.com/noname.png";

  if (user && user.profile) {
    if (user.profile.picture) {
      console.log(user.profile.picture);
    } else {
      photoSrc = "https://api.multiavatar.com/" + user.profile.name + ".png";
    }
  }

  const items = nav_tabs.map((link) => {
    const hasSubitems = Array.isArray(link.subitems) && link.subitems.length > 0;
    if (hasSubitems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
          openDelay={100}
          closeDelay={200}
        >
          <Menu.Target>
            <UnstyledButton className={classes.link}>
              <Center inline>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown
                  size={rem(14)}
                  stroke={2.5}
                  style={{ marginLeft: rem(5) }}
                />
              </Center>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {link.subitems.map((item) => (
              <Menu.Item
                key={item.label}
                component={Link}
                href={item.link}
                className={classes.subLink}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Link key={link.label} href={link.link} className={classes.link}>
        {link.label}
      </Link>
    );
  });

  const getLoginUrl = () => {
    return `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  };

  async function handleLogout() {
    await fetch("/api/logout");
    mutate({ user: null });
  }

  return (
    <>
      <Box pb={10}>
        <header className={classes.header}>
          <Group justify="space-between" h="100%">
            {user && user ? (
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
            ) : (
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
            )}

            <Group
              h="100%"
              mt="1rem"
              gap={0}
              visibleFrom="sm"
              className={classes.hiddenMobile}
            >
              {items}
            </Group>

            <Group className={classes.hiddenMobile}>
              {user && user ? (
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
                          id="user-avatar"
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
                    {user.roles && user.roles.length > 0 && (
                      <Link href="/admin">
                        <Menu.Item
                          icon={<IconBriefcase size="0.9rem" stroke={1.5} />}
                        >
                          Admin
                        </Menu.Item>
                      </Link>
                    )}
                    <Menu.Item
                      icon={<IconLogout size="0.9rem" stroke={1.5} />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <>
                  <Link href={getLoginUrl()}>
                    <Button variant="default" id="login-button">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign up</Button>
                  </Link>
                </>
              )}
            </Group>

            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className={classes.hiddenDesktop}
              aria-label="Navigation"
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

            {user ? (
              <Box px="md" pb="md">
                <Group>
                  <Avatar src={photoSrc} radius="xl" size={40} />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {user.profile?.name || "Username"}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {user.email}
                    </Text>
                  </div>
                </Group>

                <Stack gap={0} mt="md">
                  <NavLink
                    label="Account settings"
                    leftSection={<IconSettings size="1.2rem" stroke={1.5} />}
                    component={Link}
                    href="/profile"
                    onClick={closeDrawer}
                    styles={{ label: { fontSize: rem(16) } }}
                  />
                  <Divider color="dark.4" />
                  {user.roles && user.roles.length > 0 && (
                    <>
                      <NavLink
                        label="Admin"
                        leftSection={<IconBriefcase size="1.2rem" stroke={1.5} />}
                        component={Link}
                        href="/admin"
                        onClick={closeDrawer}
                        styles={{ label: { fontSize: rem(16) } }}
                      />
                      <Divider color="dark.4" />
                    </>
                  )}
                  <NavLink
                    label="Logout"
                    leftSection={<IconLogout size="1.2rem" stroke={1.5} />}
                    onClick={() => {
                      handleLogout();
                      closeDrawer();
                    }}
                    styles={{ label: { fontSize: rem(16) } }}
                  />
                </Stack>
              </Box>
            ) : null}

            <Divider my="sm" color={"dark"} />

            <Stack gap={0}>
              {nav_tabs.map((tab, index) => {
                const hasSubitems =
                  Array.isArray(tab.subitems) && tab.subitems.length > 0;
                return (
                  <React.Fragment key={tab.label}>
                    <NavLink
                      label={tab.label}
                      component={hasSubitems ? "button" : Link}
                      href={hasSubitems ? undefined : tab.link}
                      onClick={hasSubitems ? undefined : closeDrawer}
                      childrenOffset={28}
                      className={classes.navLink}
                      styles={{
                        label: {
                          fontSize: rem(18),
                          fontWeight: 600,
                          padding: `${rem(8)} 0`,
                        },
                      }}
                    >
                      {hasSubitems &&
                        tab.subitems.map((sub, subIndex) => (
                          <React.Fragment key={sub.label}>
                            <NavLink
                              label={sub.label}
                              component={Link}
                              href={sub.link}
                              onClick={closeDrawer}
                              styles={{
                                label: {
                                  fontSize: rem(16),
                                  padding: `${rem(4)} 0`,
                                },
                              }}
                            />
                            {subIndex < tab.subitems.length - 1 && (
                              <Divider color="dark.4" variant="dotted" />
                            )}
                          </React.Fragment>
                        ))}
                    </NavLink>
                    {index < nav_tabs.length - 1 && <Divider color="dark.4" />}
                  </React.Fragment>
                );
              })}
            </Stack>

            <Divider my="sm" color={"dark"} />
            {!user && (
              <Group justify="center" grow pb="xl" px="md">
                <Link href={getLoginUrl()} onClick={closeDrawer}>
                  <Button variant="default" fullWidth size="md">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeDrawer}>
                  <Button fullWidth size="md">
                    Sign up
                  </Button>
                </Link>
              </Group>
            )}
          </ScrollArea>
        </Drawer>
      </Box>
      {children}
    </>
  );
}
