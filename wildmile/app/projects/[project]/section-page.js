'use client'
 
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
 
export default function ExampleClientComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
 
  // ...
}
export default function SectionPage() {
  return (
    <>
      <h1>Section Page</h1>
    </>
  )
}