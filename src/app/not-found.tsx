"use client";

import Image from "next/image";
import Link from "next/link";
import notFoundImg from "@/assets/images/not-found-img.png";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col justify-center items-center text-center h-screen bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <Image
          src={notFoundImg}
          alt="Página não encontrada"
          width={280}
          height={280}
          priority
          className="object-contain"
        />

        <h1 className="text-4xl font-bold text-[#1162AE]">404</h1>
        <p className="text-lg text-gray-700 max-w-xs">
          Oops! A página que você procura está em construção ou não foi
          encontrada.
        </p>

        <Link
          href="/"
          className="mt-6 bg-[#1162AE] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
        >
          Voltar ao início
        </Link>
      </motion.div>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        <p>Dev PBDias © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
