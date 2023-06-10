"use client";
import React from "react";
import Header from "@/components/header";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useContractRead,
  useContractEvent,
} from "wagmi";
import { Alert, FormControl, Snackbar, Button } from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import INRLogo from "/public/inrLogo.svg";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import { abi } from "../../abi/abi";
import { polygonMumbai } from "viem/chains";

export default function Mint() {
  const [amount, setAmount] = useState(0);
  const [value, setValue] = useState("");
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [snackbar, setSnackBar] = useState(false);
  const [isError, setError] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [secret, setSecret] = useState();
  const [isScreenLoading, setScreenLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const handlerAddress = process.env.NEXT_PUBLIC_HANDLER;
  const path = process.env.NEXT_PUBLIC_SECRET_PATH;

  const db = getFirestore(app);

  const { address, isConnected } = useAccount();

  const { config } = usePrepareContractWrite({
    address: handlerAddress,
    abi: abi,
    functionName: "mint",
    args: [expectedAmount * 10 ** 18, address, secret],
  });

  const { data: data1, write, isError: writeError } = useContractWrite(config);
  useContractEvent({
    address: "0x05b418bf83bc29e0439a1D8376d4b98b9d820a5f",
    abi: abi,
    chainId: polygonMumbai.id,
    eventName: "Mint",
    listener(log) {
      if (address == log[0].args.minter) {
        setTxSuccess(true);
        setScreenLoading(false);
      }
    },
  });
  const { data: contractBalance } = useContractRead({
    address: handlerAddress,
    abi: abi,
    functionName: "balance",
    chainId: polygonMumbai.id,
    watch: true,
  });

  async function getSecret() {
    const docreference = doc(db, "secret", path);
    const docsnap = await getDoc(docreference);
    setSecret(docsnap.data().secret);
  }

  function payment() {
    return true;
  }

  function handleAmount(e) {
    e.preventDefault();
    setAmount(e.target.value);
  }

  function handleClose() {
    setSnackBar(false);
    setError(false);
  }

  function createError(message) {
    setError(true);
    setErrorMessage(message);
  }

  async function storeMintinDb() {
    try {
      await addDoc(collection(db, `app/mints/${address}`), {
        amount: expectedAmount,
        paid: amount,
        txHash: txHash,
      });
      setSnackBar(true);
      setTxSuccess(false);
      setSecret(null);
    } catch (e) {
      console.error(e.message);
    }
  }

  async function handleMint() {
    if (expectedAmount < 1) {
      createError("Invalid value. Minimum order value is 1 DINR");
    } else if (contractBalance < expectedAmount * 10 ** 18) {
      createError("Not enough liquidity in smart contract");
      console.log("Not enough liquidity");
    } else {
      write?.();
      setScreenLoading(true);
    }
  }

  useEffect(() => {
    if (txSuccess) {
      storeMintinDb();
    }
  }, [txSuccess]);

  useEffect(() => {
    setTxHash(data1 ? data1.hash : "");
    if (writeError) {
      setScreenLoading(false);
      createError("Unable to mint DINR");
    }
  }, [data1, writeError]);

  useEffect(() => {
    setExpectedAmount(amount - (amount * 1) / 100);
    if (payment()) {
      getSecret();
    }
    if (amount == 0) {
      setValue("");
    } else {
      setValue(amount);
    }
  }, [amount, secret]);

  const body = () => {
    if (isConnected) {
      return (
        <div className="flex flex-row items-center justify-around">
          <div className="flex flex-col items-center p-10">
            <FormControl>
              <input
                placeholder="Enter the amount in INR"
                value={value}
                onChange={(e) => {
                  handleAmount(e);
                }}
                className="color-white bg-black p-2"
                type="number"
                style={{
                  borderBottom: "3px solid grey",
                }}
              />
              <p className="m-5">Expected amount in DINR: {expectedAmount}</p>
            </FormControl>
            <Button
              disabled={isScreenLoading}
              onClick={() => {
                handleMint();
              }}
            >
              Mint
            </Button>
            <p className="text-gray-500">Platform fees: 1%</p>
            <p>
              [A payment interface will be present here on the Mainnet version]
            </p>
          </div>
          <div className="">
            <div className="flex flex-row items-center">
              {expectedAmount}{" "}
              <Image
                src={INRLogo}
                width={20}
                height={20}
                alt="Dart"
                className="m-2"
              />{" "}
              will be sent to
            </div>
            <div className="text-3xl">{address}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center p-20">
          Please Connect your wallet to mint tokens
        </div>
      );
    }
  };

  return (
    <div className="">
      <div className="flex flex-col">
        <Header />
        {body()}
      </div>
      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => {
          handleClose();
        }}
      >
        <Alert severity="success">
          You have minted {expectedAmount} DINR. The transaction is succesfull
        </Alert>
      </Snackbar>
      <Snackbar
        open={isError}
        autoHideDuration={3000}
        onClose={() => {
          handleClose();
        }}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </div>
  );
}
