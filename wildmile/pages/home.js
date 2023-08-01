import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../lib/hooks'

export default function HomePage() {

	const [user, { loading }] = useUser()

	useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

	return (
		<>
			<h1>Home Page</h1>
			<p className="centered-text">Collecting and sharing data about Urban River's projects.</p>
			<div className="row">
				<div className="column">
					<h2>Trash</h2>
					<p>Check Trash Info</p>
					<button className="right-button">
						<Link href="/trash">
							Trash
						</Link>
					</button>
				</div>
				<div className="column">
					<h2>Plants</h2>
					<p>Manage the plants on the wild mile</p>
					<button className="right-button">
						<Link href="/plants">
							Plants
						</Link>
					</button>
				</div>
			</div>
			<div className="row">
				<div className="column">
					<h2>Projects</h2>
					<p>See the Current Wild Mile Projects</p>
					<button className="right-button">
						<Link href="/projects">
							Projects
						</Link>
					</button>
				</div>
				{user && user.admin ? <div className="column">
					<h2>Admin</h2>
					<p>Manage the users on the wild mile</p>
					<button className="right-button">
						<Link href="/admin">
							Users
						</Link>
					</button>
				</div> : <></>}
			</div>
		</>
	)
}
