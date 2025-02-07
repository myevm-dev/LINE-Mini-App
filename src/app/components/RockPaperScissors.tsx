"use client";
import { useEffect, useState } from "react";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useReadContract,
} from "thirdweb/react";
import { client } from "../client";
import { inAppWallet } from "thirdweb/wallets";
import { shortenAddress } from "thirdweb/utils";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { claimTo, getBalance } from "thirdweb/extensions/erc20";
import liff from "@line/liff";

type Choice = "Rock" | "Paper" | "Scissors";
type Result = "Win" | "Lose" | "Tie";

const choices: Choice[] = ["Rock", "Paper", "Scissors"];

const getComputerChoice = (): Choice =>
  choices[Math.floor(Math.random() * choices.length)];

const determineWinner = (
  playerChoice: Choice,
  computerChoice: Choice
): Result => {
  if (playerChoice === computerChoice) return "Tie";
  if (
    (playerChoice === "Rock" && computerChoice === "Scissors") ||
    (playerChoice === "Paper" && computerChoice === "Rock") ||
    (playerChoice === "Scissors" && computerChoice === "Paper")
  ) {
    return "Win";
  }
  return "Lose";
};

interface GameResult {
  playerChoice: Choice;
  computerChoice: Choice;
  gameResult: Result;
}

export default function RockPaperScissors() {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT!,
  });

  const [result, setResult] = useState<GameResult | null>(null);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [prizeClaimed, setPrizeClaimed] = useState<boolean>(false);

  const handleChoice = (playerChoice: Choice) => {
    const computerChoice = getComputerChoice();
    const gameResult = determineWinner(playerChoice, computerChoice);
    setResult({ playerChoice, computerChoice, gameResult });
    setShowPrize(gameResult === "Win");
  };

  const resetGame = () => {
    setResult(null);
    setShowPrize(false);
    setPrizeClaimed(false);
  };

  const claimPrize = () => {
    setShowModal(true);
  };

  const { data: tokenbalance } = useReadContract(getBalance, {
    contract: contract,
    address: account?.address!,
  });

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-gray-200 text-gray-800">
      <div className="p-8 mx-2 w-[400px] max-w-[98%] h-[400px] bg-white rounded-lg shadow-md flex flex-col items-center justify-start relative">
        <h1 className="text-2xl font-bold mb-8 text-center">Mini Game</h1>
        {!account ? (
          <ConnectButton
            client={client}
            accountAbstraction={{
              chain: baseSepolia,
              sponsorGas: true,
            }}
            wallets={[
              inAppWallet({
                auth: {
                  options: ["email"],
                },
              }),
            ]}
          />
        ) : (
          <>
            <div className="flex flex-row h-auto w-full gap-2 items-center justify-between border border-gray-200 p-2">
              <div>
                <p>{shortenAddress(account.address)}</p>
                <p className="text-xs mb-[-10px]">
                  Balance: {tokenbalance?.displayValue}
                </p>
              </div>
              <button
                onClick={() => disconnect(wallet!)}
                className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700"
              >
                Logout
              </button>
            </div>
            {!result ? (
              <div>
                <h3>Choose your option:</h3>
                <div className="flex justify-center gap-2 m-8">
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleChoice(choice)}
                      className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer text-5xl"
                    >
                      {choice === "Rock"
                        ? "🪨"
                        : choice === "Paper"
                        ? "📄"
                        : "✂️"}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-2xl mb-[10px]">
                  You chose: {result.playerChoice}
                </p>
                <p className="text-2xl mb-[20px]">
                  Computer chose: {result.computerChoice}
                </p>
                <p className="font-bold text-3xl">
                  Result: {result.gameResult}
                </p>

                <div className="absolute bottom-8 flex flex-col gap-4 items-center">
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer"
                  >
                    Try Again
                  </button>

                  {showPrize && !prizeClaimed && (
                    <button
                      onClick={claimPrize}
                      className="px-4 py-2 bg-yellow-400 text-black border-none rounded cursor-pointer"
                    >
                      Claim Prize
                    </button>
                  )}

                  {showModal && (
                    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex justify-center items-center">
                      <div className="bg-white p-8 rounded-lg max-w-sm text-center">
                        <h2 className="text-xl mb-4">Claim 10 Tokens!</h2>
                        <p className="mb-4">
                          You won and can claim 10 tokens to your wallet.
                        </p>

                        <TransactionButton
                          transaction={() =>
                            claimTo({
                              contract: contract,
                              to: account.address,
                              quantity: "10",
                            })
                          }
                          onTransactionConfirmed={() => {
                            alert("Prize claimed!");
                            setShowModal(false);
                            setPrizeClaimed(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer"
                        >
                          Claim Prize
                        </TransactionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
