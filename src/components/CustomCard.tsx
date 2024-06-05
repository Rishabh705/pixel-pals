import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CustomCard({avatarImg, avatarFallback, title, subtitle}: {avatarImg: string, avatarFallback: string, title: string, subtitle?: string}) {
    return (
        <>
            <Avatar>
                <AvatarImage src={avatarImg} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-md font-semibold text-secondary-foreground">
                    {title}
                </h2>
                <p className="text-xs font-medium text-secondary-foreground">
                    {subtitle}
                </p>
            </div>
        </>
    )
}
