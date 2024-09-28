import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { decryptData } from "@/lib/E2EE";
import { useAppSelector } from "@/rtk/hooks";

export default function SentMsg({ cipher, time }: { cipher: string; time: string }) {
  const [text, setText] = useState<string>("");
  const AESkey = useAppSelector(state=>state.key.encryptionKey);
  
  useEffect(() => {
    const decryptMessage = async () => {
      try {
        const decryptedText = await decryptData(cipher, AESkey);
        setText(decryptedText);
      } catch (error) {
        console.error("Decryption error:", error);
      }
    };
    decryptMessage();
  }, [cipher, AESkey]);
  
  function extractTime(isoString: string): string {
    const dateObj = new Date(isoString);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const msgTime: string = extractTime(time);

  return (
    <>
      <div className="max-w-xl">
        <div className="bg-primary p-2 rounded-l-xl rounded-tr-xl">
          <p className="text-primary-foreground text-sm font-medium break-all">
            {text || "Decrypting..."}
          </p>
        </div>
        <div className="flex justify-end items-center gap-1">
          <h5 className="text-secondary-foreground text-xs font-medium">You</h5>
          <span className="text-secondary-foreground">&#8226;</span>
          <p className="text-secondary-foreground text-xs font-medium">{msgTime}</p>
        </div>
      </div>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </>
  );
}
