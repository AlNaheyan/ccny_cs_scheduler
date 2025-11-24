import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { CircleUser } from "lucide-react"
import Logo from '../public/acadion_icon1.png'
import Link from "next/link"
import Image from "next/image"

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border border-b-1 border-zinc-200 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href='/'>
              <Image
                src={Logo}
                alt="Acadion logo"
                width={120}
                height={32}
                className="mr-2"
              />
            </Link>
          </div>
          <div className="flex gap-10">
            <div className="flex justify-end">
              <Button variant='ghost' className="font-semibold text-sm">
                <Link href='/checkCourse'> Find my courses</Link>
              </Button>
              <Button variant='ghost' className="font-semibold text-sm">
                <Link href='/Catalog'>Courses</Link>
              </Button>
              <Button variant='ghost' className="font-semibold text-sm">
                <Link href='/profile'>Profile</Link>
              </Button>
            </div>
            <SignedOut>
              <SignInButton>
                <Button variant="default">
                  <CircleUser /> Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* You can place User related buttons or links here */}
              <UserButton userProfileUrl="/profile" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}

