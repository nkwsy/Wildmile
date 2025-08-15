import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url query parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type')

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 })
  }
}
