"use client";

import Image from "next/image";

export default function FooterLogo() {
  return (
    <div className="w-full flex justify-center mt-12 mb-6 opacity-80 hover:opacity-100 transition">
      <Image
        src="/recoora-logo.png"   // put your image in /public
        alt="Recoora"
        width={140}
        height={40}
        className="object-contain"
        priority
      />
    </div>
  );
}