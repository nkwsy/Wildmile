import { useUser } from '../lib/hooks'
import Router from 'next/router'

export function NavAvatarPhoto() {
  const [user] = useUser()
  let photoSrc = <img src={'https://api.multiavatar.com/noname.png'} alt="Avatar Image" onClick={() => { Router.push('/profile') }} className='nav-profile' />


  if (user && user.profile) {
    if (user.profile.picture) {
      console.log(user.profile.picture)
    } else {
      photoSrc = 'https://api.multiavatar.com/' + user.profile.name + '.png'
    }
  }

  return (
    <>
      <img src={photoSrc} alt="Avatar Image" onClick={() => { Router.push('/profile') }} className='nav-profile' />
    </>
  )
}

export function ProfileAvatarPhoto() {
  const [user] = useUser()
  let photoSrc = <img src={'https://api.multiavatar.com/noname.png'} alt="Avatar Image" onClick={() => { Router.push('/profile') }} className='nav-profile' />


  if (user && user.profile) {
    if (user.profile.picture) {
      console.log(user.profile.picture)
    } else {
      photoSrc = 'https://api.multiavatar.com/' + user.profile.name + '.png'
    }
  }

  return (
    <>
      <img src={photoSrc} alt="Avatar Image" onClick={() => { Router.push('/profile') }} className='profile-photo' />
    </>
  )
}