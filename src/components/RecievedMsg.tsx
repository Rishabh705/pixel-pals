import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function RecievedMsg({ text, user, time }: { text: string; user: string; time: string }) {

    function extractTime(isoString:string): string{
        const dateObj = new Date(isoString)
        const hours = dateObj.getHours().toString().padStart(2, '0') 
        const minutes = dateObj.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }
    const msgTime:string = extractTime(time)

    return (
        <>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
                <div className='bg-background p-2 rounded-r-xl rounded-tl-xl'>
                    <p className='text-foreground text-sm font-medium'>{text}</p>
                </div>
                <div className="flex justify-start items-center gap-1">
                    <h5 className="text-primary-forground text-xs font-semibold">{user}</h5>
                    <span className="text-secondary-forground">🞄</span>
                    <p className="text-primary-forground text-xs font-semibold">{msgTime}</p>
                </div>
            </div>
        </>
    )
}
