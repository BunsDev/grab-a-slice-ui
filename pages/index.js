import { useEffect, useState } from "react";
import Head from "next/head";
import { Form } from "../components/Form";
import { Logo } from "../components/Logo";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractEvent,
} from "wagmi";
import { address } from "../ContractConfig";
import GrabASlice from "../GrabASlice.json";
import { ConnectModal } from "../components/ConnectModal";
import { Header } from "../components/Header";
import { SliceGallery } from "../components/SliceGallery";

export default function Home() {
  // state
  const [slice, setSlice] = useState({
    crust: "Classic",
    toppings: [],
    sauce: "Marinera",
    cheese: "Mozzarella",
    name: "Anonymous",
    message: "none",
  });

  // wagmi hooks
  const { isConnected } = useAccount();
  const {
    data: contract,
    config,
    error,
  } = usePrepareContractWrite({
    address: address,
    abi: GrabASlice.abi,
    functionName: "grabSlice",
    args: [
      slice.crust,
      slice.toppings,
      slice.sauce,
      slice.cheese,
      slice.name,
      slice.message,
    ],
  });
  const { write, isSuccess } = useContractWrite(config);
  useContractEvent({
    address: address,
    abi: GrabASlice.abi,
    eventName: "NewSlice",
    listener(from, timestamp, crust, toppings, sauce, cheese, name, message) {
      console.log(
        "Someone grabbed a new slice!",
        from,
        timestamp,
        crust,
        toppings,
        sauce,
        cheese,
        name,
        message
      );
    },
  });

  function addTopping(e) {
    if (e.target.checked) {
      const newToppings = slice.toppings;
      newToppings.push(e.target.value);
      setSlice((slice) => ({
        ...slice,
        toppings: newToppings,
      }));
    }
    if (!e.target.checked) {
      const index = slice.toppings.indexOf(e.target.value);
      const newToppings = slice.toppings;
      newToppings.splice(index, 1);
      setSlice((slice) => ({ ...slice, toppings: newToppings }));
    }
  }

  function reload(delay) {
    setTimeout(() => {
      location.reload();
    }, delay);
  }

  // handle submit
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      write();
    } catch (error) {
      console.log(error);
    }
    // reload(5000);
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto flex flex-col justify-between">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-col items-center justify-between h-full">
        <h1 className="text-6xl mb-8 font-black">Grab a Slice</h1>
        {isConnected ? (
          <Form
            slice={slice}
            setSlice={setSlice}
            addTopping={addTopping}
            handleSubmit={handleSubmit}
          />
        ) : (
          <ConnectModal />
        )}
        <SliceGallery />
      </main>

      <footer className="w-full flex flex-col items-center justify-center py-2">
        <p>
          Made with 🍕 by{" "}
          <a className="text-red-500" href="https://twitter.com/adamlevoy">
            @adamlevoy
          </a>
        </p>
        <a
          className="text-xs text-gray-400"
          href="https://www.flaticon.com/free-icons/pizza"
          title="pizza icons"
        >
          Pizza logo by Freepik - Flaticon
        </a>
      </footer>
    </div>
  );
}
