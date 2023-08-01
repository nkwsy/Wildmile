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

            <style>{`
          .nav-profile {
            height: 2rem;
            cursor: pointer;
          }
        `}</style>
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

            <style>{`
          .profile-photo {
            max-width: 300px;
            height: auto;
            margin-left: auto;
            margin-right: auto;
            display: block;
          }
        `}</style>
        </>
    )
}