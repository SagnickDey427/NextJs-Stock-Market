"use client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { LogOut } from "@hugeicons/core-free-icons"
import NavItems from "./NavItems"

export default function UseDropDown() {
    const router = useRouter();
    const handleSignOut = async () => {
        router.push("/signIn")
    }
    const user = { name: "Sagnick", email: "sd@gmail.com" }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'flex items-center gap-3 text-gray-400 hover:text-yellow-500' })}>
                <Avatar className='h-8 w-8'>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className='bg-yellow-500 text-yellow-900 font-medium text-sm'>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-base font-medium text-gray-400">{user.name}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='text-gray-400'>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        <div className='flex relative items-center gap-3 py-2'>
                            <Avatar className='h-10 w-10'>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className='bg-yellow-500 text-yellow-900 font-medium text-sm'>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-base font-medium text-gray-400">{user.name}</span>
                                <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className='bg-gray-600'/>
                <DropdownMenuItem onClick={handleSignOut} className='text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer'>
                    LogOut
                </DropdownMenuItem>
                <DropdownMenuSeparator className='sm:hidden bg-gray-600'/>
                <nav className="sm:hidden">
                    <NavItems/>
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}