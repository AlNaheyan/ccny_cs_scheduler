import { Button } from "@/components/ui/button";
import Link from "next/link";
import Nav from '../app/components/Nav'
import Image from "next/image"
import Hero_Img from '../public/hero_img.png'

export default function Home() {

  return (
    <div className="min-h-screen bg-white p-6 text-black flex items-center">
      <Nav />
      <section className="pt-24 pb-12 ml-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-8">
            <h1 className="text-6xl font-bold mb-4">Organize your academic life with ease</h1>
            <p className="text-xl text-zinc-500 mb-8">
              Keep your academy journey on track with Acadions powerful planning tools
            </p>
            <div className="flex space-x-6">
              <Button className="bg-black hover:bg-gray-800 text-white text-md py-4 px-5">
                <Link href='/sign-up'>Get Started</Link>
              </Button>
              <Button variant="outline" className="text-md py-4 px-4">
                <Link href='/Catalog'>Check out courses</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <Image
              src={Hero_Img}
              alt="Acadion dashboard preview"
              width={800}
              height={400}
              className="rounded-lg shadow-lg -skew-x-6"
            />
          </div>
        </div>
      </section>
    </div>
  );
}