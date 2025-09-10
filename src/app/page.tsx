"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function MobileApp() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden lg:hidden">
      <Image src="/Opening.png" alt="Cow App Logo" fill className="object-cover" priority />

      <div className="absolute top-6 left-6">
        <h1 className="text-4xl font-bold text-orange-500 font-sans tracking-wide">
          OURO
          <br />
          RICO
        </h1>
      </div>
    </div>
  )
}
