import Link from 'next/link'
import { useUser } from '../lib/hooks'
import { NavAvatarPhoto } from './avatar'
import Router from 'next/router'

export default function Navbar() {
  const [user, { mutate }] = useUser()

  async function handleLogout() {
    await fetch('/api/logout')
    mutate({ user: null })
    Router.push('/')
  }

  return (
    <header>
      <nav>
        <ul>
          <li>
            {user && <Link href={user ? '/home' : '/'}>
              <img src='logo.png' alt='Urban River Logo' className='nav-logo' />
            </Link>}
          </li>

          {user ? (
            <>
              <li>
                <Link href='/profile'>
                  <NavAvatarPhoto />
                </Link>
              </li>
              <li>
                <a role="button" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/signup" legacyBehavior>
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" legacyBehavior>
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <style jsx>{`
        nav {
          margin: 0 auto;
          padding: 0.2rem 1.25rem;
        }
        .nav-logo {
          height: 4rem;
          cursor: pointer;
        }
        ul {
          display: flex;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }
        li {
          margin-right: 1rem;
        }
        li:first-child {
          margin: -1rem auto -1rem 0;
        }
        a {
          color: #fff;
          text-decoration: none;
          cursor: pointer;
        }
        header {
          color: #fff;
          background-color: #666;
        }
      `}</style>
    </header>
  )
}
