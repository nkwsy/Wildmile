import { createStyles, Image, Group, ActionIcon, Text } from '@mantine/core'
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react'
import classes from '/styles/footer.module.css'

export default function Footer() {

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Text>
          Urban Rivers {new Date().getFullYear()}
        </Text>

        <Group sgap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandTwitter size="1.05rem" stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandYoutube size="1.05rem" stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandInstagram size="1.05rem" stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  )
}