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

  const handlerAddress = process.env.NEXT_PUBLIC_HANDLER;
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN;

  const { data: tokenSupply } = useContractRead({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "totalSupply",
    chainId: polygonMumbai.id,
    watch: true,
  });
  const { data: contractBalance } = useContractRead({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    chainId: polygonMumbai.id,
    args: [handlerAddress],
    watch: true,
  });

  useEffect(() => {
    if (circulation == "NaN") {
      setCirculation(0);
    }
  }, [circulation]);

  useEffect(() => {
    setSupply(Number(tokenSupply) / 10 ** 18);
    setCirculation(Number(tokenSupply) - Number(contractBalance) / 10);
    console.log(parseInt(contractBalance));
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
              <span className="bg-blue-800 p-2 rounded-md">
                {supply.toFixed(0)}
              </span>{" "}
              DINR Issued
            </div>{" "}
            <div className="">
              <span className="bg-blue-800 p-2 rounded-md">
                {parseInt(circulation.toFixed(0))}
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
