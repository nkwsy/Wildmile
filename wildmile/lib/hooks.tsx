// import useSWR from 'swr'

// export const fetcher = (url) => fetch(url).then((r) => r.json())

// export function useUser() {
//   const { data, mutate, isLoading } = useSWR('/api/user', fetcher)
//   // if data is not defined, the query has not completed
//   const loading = isLoading || !data
//   const user = data?.user
//   return [user, { mutate, loading }]
// }

import useSWR, { SWRResponse } from 'swr'

export const fetcher = (url: string): Promise<any> => fetch(url).then((r) => r.json())

interface User {
  // Define the properties of your User object here
}

export function useUser(): [User | undefined, { mutate: (data?: User | Promise<User> | undefined, shouldRevalidate?: boolean | undefined) => Promise<User | undefined>, loading: boolean }] {
  const { data, mutate } = useSWR<User>('/api/user', fetcher)
  // if data is not defined, the query has not completed
  const loading = !data
  const user = data
  return [user, { mutate, loading }]
}