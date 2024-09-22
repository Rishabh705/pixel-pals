import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { decryptData } from "@/lib/helpers";
import { useState, useEffect } from "react";

export default function RecievedMsg({ cipher, participant, time }: { cipher: string; participant: string; time: string }) {
    const [text, setText] = useState<string>("");

    useEffect(() => {
        const decryptMessage = async () => {
            const decryptedText = await decryptData(cipher, "receiver");
            setText(decryptedText);
        };
        decryptMessage();
    }, [cipher]);
    function extractTime(isoString: string): string {
        const dateObj = new Date(isoString)
        const hours = dateObj.getHours().toString().padStart(2, '0')
        const minutes = dateObj.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }
    const msgTime: string = extractTime(time)

    return (
        <>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="max-w-xl">
                <div className='bg-background p-2 rounded-r-xl rounded-tl-xl'>
                    <p className='text-foreground text-sm font-medium break-all'>
                        {text || 'Decrypting...'}
                    </p>
                </div>
                <div className="flex justify-start items-center gap-1">
                    <h5 className="text-primary-forground text-xs font-semibold">{participant}</h5>
                    <span className="text-secondary-forground">🞄</span>
                    <p className="text-primary-forground text-xs font-semibold">{msgTime}</p>
                </div>
            </div>
        </>
    )
}
