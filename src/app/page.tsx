import Navbar from "./components/Navbar";
import dynamic from "next/dynamic";

const Player = dynamic(() => import("./components/Player"), { ssr: false });
const Chat = dynamic(() => import("./components/Chat"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-neutral-200 overflow-x-hidden">
      <Navbar />
      {/* Full-height area under the navbar. Adjust 4rem if your navbar height differs */}
      <div className="w-full h-[calc(100vh-4rem)]">
        <div className="mx-auto h-full w-full max-w-7xl px-4 lg:px-6 py-4">
          <div className="grid h-full grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="h-full w-full">
              <Player />
            </div>
            <div className="h-full w-full">
              <Chat />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
