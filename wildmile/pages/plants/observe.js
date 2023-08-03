import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../../lib/hooks'

export default function PlantLanding() {

	const [user, { loading }] = useUser()

	useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])
  
  return (
    <>
      <h1>Urban River Plant Observations</h1>
      <p>Coming Soon</p>
    </>
  )
}