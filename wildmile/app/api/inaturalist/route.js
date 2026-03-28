import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const taxon_id = searchParams.get('taxon_id')
  const place_id = searchParams.get('place_id')

  let apiUrl = `https://api.inaturalist.org/v1/taxa?q=${query}`

  if (taxon_id) {
    apiUrl += `&taxon_id=${taxon_id}`
  }

  if (place_id) {
    apiUrl += `&place_id=${place_id}`
  }

  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data from iNaturalist' }, { status: 500 })
  }
}
