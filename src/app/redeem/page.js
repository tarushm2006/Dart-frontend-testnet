"use client";
import Header from "@/components/header";
import { useAccount } from "wagmi";
import { FormControl, Button, Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import {
  usePrepareContractWrite,
  useContractWrite,
  useContractEvent,
  useContractRead,
} from "wagmi";
import { abi } from "../../abi/abi";
import { tokenAbi } from "../../abi/token";
import { polygonMumbai } from "viem/chains";

export default function Redeem() {
  const [amount, setAmount] = useState(0);
  const [value, setValue] = useState("");
  const [snackbar, setSnackBar] = useState(false);
  const [txHash, setTxHash] = useState("0x0");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonText, setButtonText] = useState("Approve");
  const [isScreenLoading, setScreenLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const handlerAddress = process.env.NEXT_PUBLIC_HANDLER;
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN;

  const { address, isConnected } = useAccount();
  const db = getFirestore(app);

  const { config: redeemConfig, isError: redeemError } =
    usePrepareContractWrite({
      address: handlerAddress,
      abi: abi,
      functionName: "redeem",
      args: [amount * 10 ** 18],
    });
  const {
    data: data1,
    isError,
    write: writeRedeem,
  } = useContractWrite(redeemConfig);
  useContractEvent({
    address: handlerAddress,
    abi: abi,
    chainId: polygonMumbai.id,
    eventName: "Redeem",
    listener(log) {
      if (address == log[0].args.redeemer) {
        setTxSuccess(true);
      }
    },
  });

  const { config: tokenConfig, isError: approvalError } =
    usePrepareContractWrite({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "approve",
      args: [handlerAddress, 100000 * 10 ** 18],
    });
  const {
    data: data2,
    write: writeApprove,
    isError: approveError,
  } = useContractWrite(tokenConfig);
  const { data: userAllowance } = useContractRead({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "allowance",
    args: [address, handlerAddress],
    watch: true,
  });

  const { data: userBalance } = useContractRead({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

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

  async function storeRedeemInDb() {
    try {
      await addDoc(collection(db, `app/redeems/${address}`), {
        amount: amount,
        txHash: txHash,
      });
      setSnackBar(true);
      setScreenLoading(false);
      setTxSuccess(false);
    } catch (e) {
      console.error(e.message);
    }
  }

  function handleRedeem() {
    if (amount < 10) {
      createError("Minimum amount is 10 DINR");
    } else if (userBalance < amount * 10 ** 18) {
      createError("Insufficient balance");
    } else {
      if (buttonText == "Approve DINR") {
        writeApprove?.();
      } else {
        writeRedeem?.();
      }
    }
  }

  useEffect(() => {
    if (txSuccess) {
      storeRedeemInDb();
    }
  }, [txSuccess]);

  useEffect(() => {
    setTxHash(data1?.hash);
  }, [data1]);

  useEffect(() => {
    if (amount == 0) {
      setValue("");
    } else {
      setValue(amount);
    }
    if (amount == null) {
      setAmount(0);
    }
    if (userAllowance < amount) {
      setButtonText("Approve DINR");
    } else {
      setButtonText("Redeem");
    }
    if (isError) {
      createError("Unable to redeem DINR");
    }
    if (approveError) {
      createError("Unable to approve DINR");
    }
  }, [amount, userAllowance, isError, approveError]);

  const body = () => {
    if (isConnected) {
      return (
        <div className="flex flex-row items-center justify-around">
          <div className="flex flex-col items-center">
            <FormControl>
              <input
                value={value}
                disabled={isScreenLoading}
                onChange={(e) => {
                  handleAmount(e);
                }}
                placeholder="Enter the amount"
                className="color-white bg-black p-2 m-5"
                type="number"
                style={{
                  borderBottom: "3px solid grey",
                }}
              />
              <Button
                className="m-5"
                disabled={isScreenLoading}
                onClick={() => {
                  handleRedeem();
                }}
              >
                {buttonText}
              </Button>
            </FormControl>
            <p className="m-5">
              [A payment interface to recieve money will
              <br /> be present here on the mainnet version]
            </p>
          </div>
          <div className="m-10">
            <div className="text-2xl">You will receive {amount} INR</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center m-20">
          Please connect your wallet to redeem tokens
        </div>
      );
    }
  };
  return (
    <div className="">
      <Header />
      <div className="flex flex-col">{body()}</div>
      <Snackbar
        open={snackbar}
        onClose={() => {
          handleClose();
        }}
        autoHideDuration={3000}
      >
        <Alert severity="success">
          You have successfully redeemed {amount} INR
        </Alert>
      </Snackbar>
      <Snackbar
        open={error}
        onClose={() => {
          handleClose();
        }}
        autoHideDuration={3000}
      >
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </div>
  );
}
