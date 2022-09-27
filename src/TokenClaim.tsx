import { NotifyType, useTokenClaimer } from "@jeeh/tokenclaim-ui";
import { CircularProgress, Typography } from "@material-ui/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { CTAButton } from "./MintButton";

export const TokenClaimer = () => {
  const { publicKey, signAllTransactions } = useWallet();

  const notify = (msg: string, notifyType: NotifyType) => {
    console.log({ msg, notifyType });
  };
  const {
    availableAmount,
    totalWhitelistedAmount,
    claimedAmount,
    onClick,
    isFetching,
    isExecuting,
    isError,
  } = useTokenClaimer(
    {
      quickdropId: "ErpN8n2Z82CebwyJnEgc6qU7owJHrjqheB65B7uA6PHa", /// replace this with your QuickDrop ID
      apiBaseUrl: "https://quickdrop.neft.world",
      solanaRpcHost: process.env.REACT_APP_SOLANA_RPC_HOST!,
    },
    notify,
    publicKey?.toBase58(),
    signAllTransactions,
    "1"
  );

  const [highlight, setHighlight] = useState<boolean>(false);
  const [lastClaimedAmount, setLastClaimedAmount] = useState<string>();

  const processHighlight = useCallback(() => {
    const isFirstLoad = lastClaimedAmount === undefined;
    setHighlight(!isFirstLoad);
    setLastClaimedAmount(claimedAmount.toString());
    return isFirstLoad;
  }, [lastClaimedAmount]);

  useEffect(() => {
    let active = true;
    const isFirstLoad = processHighlight();

    if (!isFirstLoad) {
      setTimeout(() => {
        active && setHighlight(false);
      }, 350);
    }
    return () => {
      active = false;
    };
  }, [claimedAmount]);

  return (
    <div>
      <h2>Neft QuickDrop</h2>
      <div>
        {isError ? (
          <div>Could not connect to quickdrop API</div>
        ) : isFetching || isExecuting ? (
          <CircularProgress />
        ) : totalWhitelistedAmount > 0 ? (
          <div>
            <CTAButton
              disabled={availableAmount === BigInt(0)}
              onClick={onClick}
            >
              Claim
            </CTAButton>
            <p>
              <Typography variant="body1">Claimed</Typography>
              <Typography variant="h2" color={highlight ? "error" : "primary"}>
                {claimedAmount.toString()}
              </Typography>{" "}
            </p>
            <Typography variant="body1">
              Remaining
              <Typography variant="h2" color={highlight ? "error" : "primary"}>
                {availableAmount.toString()}{" "}
              </Typography>
            </Typography>
          </div>
        ) : (
          <div>Wallet not whitelisted</div>
        )}
      </div>
    </div>
  );
};
