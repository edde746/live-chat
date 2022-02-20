import Head from "next/head";
import io from "socket.io-client";
import { useEffect, useState } from "react";

export default function Home() {
  const [socket, setSocket] = useState();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("/api/socket").finally(() => {
      const socket = io();
      setSocket(socket);

      socket.on("connect", () => {
        console.log("connect");
      });

      socket.on("message", (data) => {
        setMessages((old) => [...old, data]);
        console.log("MESSAGE: ", data);
      });

      socket.on("disconnect", () => {
        console.log("disconnect");
      });
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Head>
        <title>live-chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-xl text-sky-500">Hello</h1>

        {messages.map((message, i) => (
          <div key={i}>
            <p className="text-sm font-semibold">{message.name}</p>
            <p>{message.content}</p>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            socket.emit("message", { content: data.get("content"), name: "Username" });
            e.target.reset();
          }}
        >
          <input type="text" name="content" />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  );
}
