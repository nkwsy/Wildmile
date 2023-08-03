import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../../lib/hooks'
import dbConnect from '../../lib/db/setup'
import Plant from '../../models/Plant'


export default function Species(props) {

  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  return (
    <>
      {
        props.plants.map((plant, index) => (
          <div key={plant.scientificName}>
            <h3 >{plant.commonName}</h3>
          </div>
        )
        )
      }
    </>
  )
}


/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await Plant.find({}, ['-_id', '-createdAt', '-updatedAt'])
  const plants = result.map((doc) => {
    const plant = doc.toObject()
    return plant
  })
  plants.sort(((a, b) => {
    const nameA = (a.scientific_name || a.scientificName).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.scientific_name || b.scientificName).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }))
  return { props: { plants: plants } }
}