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
      <h1>Urban River Plants Resources</h1>
      <div className="row">
        <div className="column">
          <h2>Plant Species</h2>
          <p>Species of the plants used in the locations and information about them</p>
          <button className="right-button">
            <Link href="/plants/species">
              Species
            </Link>
          </button>
        </div>
        <div className="column">
          <h2>Plant Observations</h2>
          <p>Plants observed at locations</p>
          <button className="right-button">
            <Link href="/plants/observe">
              Observations
            </Link>
          </button>
        </div>
      </div>
    </>
  )
}