'use client'

import { NAV_ITEMS } from '@/lib/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import SearchInput from './searchInput'

function NavItems() {
    const pathname = usePathname()
    const [showSearch, setShowSearch] = useState(false)
    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    }

    return (
        <>
            <ul className='flex flex-col sm:flex-row gap-3 p-2 sm:gap-10 font-medium'>
                {NAV_ITEMS.map(({ href, label }) => {
                    if (label === 'Search') {
                        return (
                            <li key={href}>
                                <button onClick={() => setShowSearch(true)} className={`hover:text-yellow-500 transition-colors`}>
                                    {label}
                                </button>
                            </li>
                        )
                    }
                    return (
                        <li key={href} >
                            <Link href={href} className={`hover:text-yellow-500 transition-colors ${isActive(href) ? 'text-gray-100' : ''}`}>
                                {label}
                            </Link>
                        </li>
                    )
                })}
            </ul>
            <SearchInput showSearch={showSearch} setShowSearch={setShowSearch} />
        </>
    )
}

export default NavItems