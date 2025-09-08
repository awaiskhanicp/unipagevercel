"use client";
import { useState, useRef, useEffect } from "react";

const contacts = [
  { id: 1, name: "Ali Raza", lastMessage: "Hello!", avatar: "A", unread: 0 },
  { id: 2, name: "Fatima Noor", lastMessage: "Thanks!", avatar: "F", unread: 0 },
  { id: 3, name: "Ahmed Khan", lastMessage: "See you soon.", avatar: "A", unread: 0 },
];

const smartReplies = (msg) => {
  const lower = msg.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi")) return "Hello! How can I help you?";
  if (lower.includes("how are you")) return "I'm good, thank you! How about you?";
  if (lower.includes("your name")) return "I am a smart chat bot 😊";
  if (lower.includes("what is the time")) return `The current time is ${new Date().toLocaleTimeString()}`;
  if (lower.includes("thank you")) return "You're welcome!";
  if (lower.includes("bye")) return "Goodbye! Have a nice day!";
  return "Sorry, I didn't understand. Can you please rephrase?";
};

const Conversations = () => {
  const [selectedId, setSelectedId] = useState(1);
  const [messagesData, setMessagesData] = useState({
    1: [],
    2: [],
    3: [],
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [messageId, setMessageId] = useState(1);
  const messagesEndRef = useRef(null);

  const messages = messagesData[selectedId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: messageId,
      from: "me",
      text: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessagesData((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), userMsg],
    }));

    updateLastMessage(selectedId, input);
    setInput("");
    setMessageId((prev) => prev + 1);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = {
        id: messageId + 1,
        from: "them",
        text: smartReplies(userMsg.text),
        time: new Date().toLocaleTimeString(),
      };

      setMessagesData((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), botMsg],
      }));

      updateLastMessage(selectedId, botMsg.text);
      setMessageId((prev) => prev + 1);
      setIsTyping(false);
    }, 1000);
  };

  const updateLastMessage = (id, msg) => {
    const contact = contacts.find((c) => c.id === id);
    if (contact) contact.lastMessage = msg;
  };

  const deleteMessage = (id) => {
    setMessagesData((prev) => ({
      ...prev,
      [selectedId]: prev[selectedId].filter((msg) => msg.id !== id),
    }));
  };

  const clearChat = () => {
    setMessagesData((prev) => ({ ...prev, [selectedId]: [] }));
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[80vh] bg-gray-50 rounded-2xl shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B6D76] text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-white/20">Contacts</div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="m-3 p-2 rounded text-black focus:outline-none"
        />
        <ul className="flex-1 overflow-y-auto">
          {filteredContacts.map((c) => (
            <li
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                c.unread = 0;
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/20 ${
                selectedId === c.id ? "bg-white/20" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#0B6D76] flex items-center justify-center font-bold">
                {c.avatar}
              </div>
              <div className="flex-1">
                <div className="font-medium flex justify-between items-center">
                  {c.name}
                  {c.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/80 truncate w-36">{c.lastMessage}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-[#0B6D76] text-white font-semibold text-lg flex justify-between items-center">
          {contacts.find((c) => c.id === selectedId)?.name}
          <button
            onClick={clearChat}
            className="text-sm border border-white px-2 py-1 rounded hover:bg-white hover:text-[#0B6D76] transition"
          >
            Clear Chat
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm relative ${
                  msg.from === "me"
                    ? "bg-[#0B6D76] text-white self-end"
                    : "bg-gray-200 text-gray-800 self-start"
                }`}
              >
                <div>{msg.text}</div>
                <div
                  className="text-[10px] text-right mt-1"
                  style={{ color: msg.from === "me" ? "#ffffff" : "#0B6D76" }}
                >
                  {msg.time}
                </div>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full"
                >
                  x
                </button>
              </div>
            ))}

            {isTyping && (
              <div className="max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-200 text-gray-800 self-start flex items-center">
                <span className="animate-bounce">Typing</span>
                <span className="animate-bounce delay-200 ml-1">.</span>
                <span className="animate-bounce delay-400 ml-1">.</span>
                <span className="animate-bounce delay-600 ml-1">.</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 bg-white border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-[#0B6D76] text-white px-4 py-2 rounded-xl font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
