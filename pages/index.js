import { PaperAirplaneIcon, ArrowRightIcon, GlobeIcon, LoginIcon, LogoutIcon } from "@heroicons/react/solid";
import { useState } from "react";
import Head from "next/head";
import io from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState();
  const [username, setUsername] = useState();
  const [messages, setMessages] = useState([]);

  return (
    <div className="max-w-4xl mx-auto">
      <Head>
        <title>live-chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!socket && (
        <div class="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center p-4">
          <div class="p-4 bg-slate-50 rounded-md">
            <h2 className="font-semibold text-lg">Join chat</h2>
            <p className="text-slate-500">Select a username to join the chat room.</p>
            <form
              className="flex mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                fetch("/api/connect").finally(() => {
                  const socket = io();
                  setSocket(socket);

                  socket.on("connect", () => {
                    socket.emit("name", username);
                    setMessages((old) => [...old, { event: "connected" }]);
                  });

                  socket.on("message", (data) => {
                    setMessages((old) => [...old, data]);
                  });

                  socket.on("disconnect", () => {
                    console.log("disconnect");
                  });
                });
              }}
            >
              <input
                type="text"
                className="px-3 py-1.5 text-sm rounded-l-md w-full"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <button className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 rounded-r-md transition" type="submit">
                <ArrowRightIcon className="h-5 w-5 text-slate-50" />
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="p-4 grid gap-4">
        <div>
          <h1 className="text-xl text-sky-500">live-chat</h1>
          <p>{socket ? `Logged in as ${username}` : "Waiting for connection"}</p>
        </div>

        <div>
          <div className="overflow-y-scroll h-72 rounded-t-md p-4 bg-slate-50 grid auto-rows-min gap-1">
            {messages.map((message, i) => {
              if (message.event) {
                switch (message.event) {
                  case "connected":
                    return (
                      <div key={i} className="flex gap-1 items-center">
                        <GlobeIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-sm">Connected to chat room.</p>
                      </div>
                    );
                  case "join":
                    return (
                      <div key={i} className="flex gap-1 items-center">
                        <LoginIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-sm">{message.username} has joined</p>
                      </div>
                    );
                  case "leave":
                    return (
                      <div key={i} className="flex gap-1 items-center">
                        <LogoutIcon className="h-4 w-4 text-slate-400" />
                        <p className="text-sm">{message.username} has left</p>
                      </div>
                    );

                  default:
                    break;
                }
              }

              return (
                <div key={i} className="flex gap-1 items-center">
                  <p className="text-sm font-semibold">{message.username}:</p>
                  <p>{message.content}</p>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.target);
              socket.emit("message", data.get("content"));
              setMessages((old) => [...old, { content: data.get("content"), username }]);
              e.target.reset();
            }}
            className="flex items-center rounded-b-md overflow-hidden bg-white"
          >
            <input type="text" name="content" className="flex-1 px-3 py-1.5 text-sm" />
            <button type="submit" className="px-3 py-1.5">
              <PaperAirplaneIcon className="h-5 w-5 text-slate-600 hover:text-slate-500 rotate-90 transition" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
