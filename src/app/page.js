"use client";
import Header from "../components/header";
import { app } from "./firebaseConfig";
import { getAnalytics, isSupported } from "firebase/analytics";
import { wagmiConfig } from "./wagmi";
import { WagmiConfig, useContractRead } from "wagmi";
import Image from "next/image";
import INRLogo from "/public/inrLogo.svg";
import Link from "next/link";
import { tokenAbi } from "../abi/token";
import { polygonMumbai } from "viem/chains";
import { useEffect, useState } from "react";
import { abi } from "../abi/abi";
import { Button } from "@mui/material";

export default function Home() {
  const [supply, setSupply] = useState(0);
  const [circulation, setCirculation] = useState(0);
  const analytics = isSupported().then((yes) =>
    yes ? getAnalytics(app) : null
  );

  const { data: tokenSupply } = useContractRead({
    address: "0x94267eA58ED3E40757aF2815a6af23E715300130",
    abi: tokenAbi,
    functionName: "totalSupply",
    chainId: polygonMumbai.id,
    watch: true,
  });
  const { data: contractBalance } = useContractRead({
    address: "0xA406501FDBBc0e7419b8dDD5562B6131AAE17A4c",
    abi: abi,
    functionName: "balance",
    chainId: polygonMumbai.id,
    watch: true,
  });

  useEffect(() => {
    setSupply(Number(tokenSupply) / 10 ** 18);
    setCirculation(Number(tokenSupply - contractBalance) / 10 ** 18);
  }, [tokenSupply, contractBalance]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <main className="flex min-h-screen flex-col items-center text-white">
        <Header />
        <div className="p-10 flex flex-col items-center">
          <div className="font-mono text-5xl">
            {"World's"} First{" "}
            <span className="bg-blue-800 p-2 rounded-md">stablecoin</span>{" "}
            pegged to INR
          </div>
          <div className="p-20">
            <Image src={INRLogo} width={200} height={200} alt="Dart" />{" "}
          </div>
          <div className="flex flex-row gap-20">
            <div className="">
              <span className="bg-blue-800 p-2 rounded-md">{supply}</span> DINR
              Issued
            </div>{" "}
            <div className="">
              <span className="bg-blue-800 p-2 rounded-md">
                {circulation.toFixed(0)}
              </span>{" "}
              in Circulation
            </div>
          </div>
          <div className="flex flex-row gap-20 m-10">
            <Button className="bg-blue-800 p-2 rounded-md m-5 cursor-pointer">
              <Link href="/mint">Mint</Link>
            </Button>
            <Button className="bg-blue-800 p-2 rounded-md m-5 cursor-pointer">
              <Link href="/redeem">Redeem</Link>
            </Button>
          </div>
        </div>
      </main>
    </WagmiConfig>
  );
}
