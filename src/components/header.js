import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { polygonMumbai } from "wagmi/chains";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Button } from "@mui/material";
import Link from "next/link";

export default function Header() {
  const { disconnect } = useDisconnect();

  const connecter = new MetaMaskConnector({
    chains: [polygonMumbai],
  });
  const { connect } = useConnect({
    connector: connecter,
    chainId: polygonMumbai.id,
  });
  const { address, isConnected } = useAccount();

  const wallet = () => {
    if (isConnected) {
      return (
        <div className="flex flex-row">
          <Button
            variant="contained"
            onClick={() => {
              disconnect();
            }}
          >
            Logout
          </Button>
          <Link href="/profile">
            {" "}
            <div className="bg-gray-800 p-2 rounded-md">
              {address.slice(0, 20)}...
            </div>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="">
          <div
            className="hover:bg-blue-700 p-2 rounded-md cursor-pointer"
            onClick={() => {
              connect();
            }}
          >
            Connect Wallet
          </div>
        </div>
      );
    }
  };
  return (
    <div className="p-10 flex flex-row min-w-full items-center justify-between">
      <div className="font-mono text-5xl max-w-fit">Dart</div>
      <div className="">{wallet()}</div>
    </div>
  );
}
