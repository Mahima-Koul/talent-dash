import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'TalentDash — Career Intelligence for India', template: '%s | TalentDash' },
  description: 'Structured, comparable salary data for Indian tech professionals. Find real compensation for every role, level, and company.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header style={{ background: '#fff', borderBottom: '1px solid #EBEBEB' }}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl" style={{ color: '#FF5A5F' }}>
              TalentDash
            </Link>
            <div className="flex items-center gap-6">
              {[
                { href: '/salaries',  label: 'Salaries'  },
                { href: '/companies', label: 'Companies' },
                { href: '/compare',   label: 'Compare'   },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-[#FF5A5F]"
                  style={{ color: '#484848' }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/salaries"
                className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: '#FF5A5F' }}
              >
                Add Salary
              </Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}