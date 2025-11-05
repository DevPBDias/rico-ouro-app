"use client";
import { motion } from "motion/react";
import React from "react";
import { ImagesSlider } from "../ui/images-slider";
import cow1 from "@/assets/images/Opening.png";
import cow2 from "@/assets/images/Boi1.png";
import cow3 from "@/assets/images/Boi2.png";

export function ImagesSliderDemo() {
  const images = [cow1, cow2, cow3];
  return (
    <ImagesSlider className="w-full h-full" images={images}>
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1.6,
        }}
        className="z-50 flex flex-col justify-center items-center w-full h-full"
      >
        <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-blue-500 to-transparent" />
      </motion.div>
    </ImagesSlider>
  );
}
