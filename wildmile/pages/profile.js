import { useEffect, useRef } from 'react'
import Router from 'next/router'
import { useUser } from '../lib/hooks'
import { ProfileAvatarPhoto } from '../components/avatar'

function ProfileEdit() {
  const [user, { mutate }] = useUser()
  const nameRef = useRef()
  const genderRef = useRef()
  const locRef = useRef()

  useEffect(() => {
    if (!user || !user.profile) return
    nameRef.current.value = user.profile.name || 'Empty'
    genderRef.current.value = user.profile.gender || 'Please Select'
    locRef.current.value = user.profile.location || 'Neighborhood'
  }, [user])

  async function handleEditProfile(e) {
    e.preventDefault()
    console.log(e)

    const body = {
      name: nameRef.current.value,
      gender: genderRef.current.value,
      location: locRef.current.value,
    }
    const res = await fetch(`/api/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const updatedUser = await res.json()

    mutate(updatedUser)
  }

  return (
    <>
      <div className="form-container">
        <form onSubmit={handleEditProfile}>
          <label>
            <span>Name</span>
            <input type="text" ref={nameRef} required />
          </label>
          <label>
            <span>Pronouns</span>
            <select id='pronouns' ref={genderRef}>
              <option value="">--Please choose an option--</option>
              <option>He/Him</option>
              <option>She/Her</option>
              <option>They/Them</option>
            </select>
          </label>
          <label>
            <span>Location</span>
            <input type="text" ref={locRef} />
          </label>
          <label>
            <span>Picture</span>
            <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
          </label>
          <div className="submit">
            <button type="submit">Update profile</button>
          </div>
        </form>
      </div>

      <style>
        {`
        select {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        `}
      </style>
    </>
  )
}

export default function ProfilePage() {
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/login')
  }, [user, loading])

  return (
    <>
      {user && (
        <>
          <ProfileAvatarPhoto />
          <h1>Profile</h1>
          <ProfileEdit />
        </>
      )}
    </>
  )
}
