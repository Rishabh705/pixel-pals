import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SentMsg({ text, participant, time }: { text: string; participant: string; time: string }) {

    function extractTime(isoString:string): string{
        const dateObj = new Date(isoString)
        const hours = dateObj.getHours().toString().padStart(2, '0') 
        const minutes = dateObj.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }
    const msgTime:string = extractTime(time)

    return (
        <>
            <div className="max-w-xl">
                <div className='bg-primary p-2 rounded-l-xl rounded-tr-xl'>
                    <p className='text-primary-foreground text-sm font-medium break-all'>{text}</p>
                </div>
                <div className="flex justify-end items-center gap-1">
                    <h5 className="text-primary-forground text-xs font-medium">{participant}</h5>
                    <span className="text-secondary-forground">🞄</span>
                    <p className="text-primary-forground text-xs font-medium">{msgTime}</p>
                </div>
            </div>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
        </>
    )
}
