import { useState } from "react";

export default function useDialog() {
  const [open, setOpen]     = useState(false);
  const [message, setMsg]   = useState("");

  const show = (msg: string) => {
    setMsg(msg);
    setOpen(true);
  };

  return { open, message, setOpen, show };   // show 함수만 import 해서 쓰면 됨
}
