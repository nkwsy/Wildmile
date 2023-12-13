import { createStyles, SimpleGrid, Text, Card, rem } from '@mantine/core'
import Link from 'next/link'
import classes from '/styles/card.module.css'

// export const cardStyles = createStyles((theme) => ({
//   title: {
//     fontSize: rem(34),
//     fontWeight: 900,
//     textDecoration: 'none',

//     [theme.fn.smallerThan('sm')]: {
//       fontSize: rem(24),
//     },
//   },

//   description: {
//     maxWidth: 600,
//     margin: 'auto',
//     textDecoration: 'none',

//     '&::after': {
//       content: '""',
//       display: 'block',
//       backgroundColor: theme.fn.primaryColor(),
//       width: rem(45),
//       height: rem(2),
//       marginTop: theme.spacing.sm,
//       marginLeft: 'auto',
//       marginRight: 'auto',
//     },
//   },

//   card: {
//     border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
//       }`,
//     ...theme.fn.hover({
//       backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
//     }),
//   },

//   cardTitle: {
//     textDecoration: 'none',
    
//     '&::after': {
//       content: '""',
//       display: 'block',
//       backgroundColor: theme.fn.primaryColor(),
//       width: rem(45),
//       height: rem(2),
//       marginTop: theme.spacing.sm,
//     },
//   },
// }))

// export function IconCardGrid(props) {
//   const { cards, columns } = props

//   return (
//     <>
//       <SimpleGrid mt={40} cols={columns || 2}>
//         {cards.map((card) => {
//           return (
//             <Link key={card.title} href={card.href}>
//               <Card key={card.title} shadow="md" radius="md" className={classes.card} padding="xl">
//                 <card.icon size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
//                 <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
//                   {card.title}
//                 </Text>
//                 <Text fz="sm" c="dimmed" mt="sm">
//                   {card.description}
//                 </Text>
//               </Card>
//             </Link>
//           )
//         })}
//       </SimpleGrid>
//     </>
//   )
// }

export function IconCardGrid(props) {
  const { cards, columns } = props

  return (
    <>
      <SimpleGrid mt={40} cols={columns || 2}>
        {cards.map((card) => {
          return (
            <Link key={card.title} href={card.href}>
              <Card key={card.title} shadow="md" radius="md" className={classes.card} padding="xl">
                <card.icon size='2rem' stroke={2}/>
                <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                  {card.title}
                </Text>
                <Text fz="sm" c="dimmed" mt="sm">
                  {card.description}
                </Text>
              </Card>
            </Link>
          )
        })}
      </SimpleGrid>
    </>
  )
}