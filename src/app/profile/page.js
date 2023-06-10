"use client";
import Header from "@/components/header";
import { useAccount } from "wagmi";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useEffect, useState } from "react";
import INRLogo from "../../../public/inrLogo.svg";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const db = getFirestore(app);
  const [mints, setMints] = useState([]);
  const [redeems, setRedeems] = useState([]);

  async function getMints() {
    if (address != undefined) {
      const querysnapshot = await getDocs(
        collection(db, `app/mints/${address}`)
      );
      querysnapshot.forEach((doc) => {
        setMints((oldMints) => [...oldMints, doc.data()]);
      });
    }
  }

  async function getRedeems() {
    if (address != undefined) {
      const querysnapshot = await getDocs(
        collection(db, `app/redeems/${address}`)
      );
      querysnapshot.forEach((doc) => {
        setRedeems((oldRedeems) => [...oldRedeems, doc.data()]);
      });
    }
  }

  useEffect(() => {
    setRedeems([]);
    setMints([]);
    getMints();
    getRedeems();
  }, [address]);

  useEffect(() => {
    console.log(redeems);
  }, [redeems]);

  const body = () => {
    if (isConnected) {
      return (
        <div className="flex flex-col items-center">
          <div className="flex text-2xl p-10">
            <AccountBoxIcon className="mx-5" />
            {address}
          </div>
          <div className="grid grid-cols-2 justify-center">
            <div className="">Mints</div>
            <div className="">Redeems</div>
            <div className="grid grid-cols-2 col-span-2">
              <div className="grid grid-cols-3 m-10 col-span-1">
                <div>Paid</div>
                <div>Received</div>
                <div>Transaction</div>
                <ul className="col-span-3">
                  {mints.map((mint) => (
                    <li className="grid grid-cols-3 my-5">
                      <div className="">{mint.paid} INR</div>
                      <div className="grid grid-cols-2">
                        {mint.amount.toFixed(1)}{" "}
                        <Image src={INRLogo} width="20" height="20" />{" "}
                      </div>
                      <div className="hover:bg-blue-700 p-1 rounded-md">
                        <Link
                          href={`https://mumbai.polygonscan.com/tx/${mint.txHash}`}
                        >
                          {mint.txHash.slice(0, 20)}...
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 m-10">
                <div>Received</div>
                <div>Transaction</div>
                <ul className="col-span-2">
                  {redeems.map((redeem) => (
                    <li className="grid grid-cols-2 my-5">
                      <div>{redeem.amount} INR</div>
                      <div className="hover:bg-blue-700 p-1 rounded-md">
                        <Link
                          href={`https://mumbai.polygonscan.com/tx/${redeem.txHash}`}
                        >
                          {redeem.txHash.slice(0, 20)}...
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="m-20 flex flex-col items-center">
          Please connect your wallet to continue
        </div>
      );
    }
  };
  return (
    <div className="flex flex-col items-center">
      <Header />
      <div className="">{body()}</div>
    </div>
  );
}
