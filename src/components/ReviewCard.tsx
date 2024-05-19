import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ReviewCard({ className, name, position, company, review, avatar }: { className?: string, name: string, position: string, company: string, review: string, avatar?: string }) {
    return (
        <Card className={cn(" flex flex-col justify-between", className)}>
            <CardContent className="pt-6">
                <CardDescription className="text-sm font-medium leading-tight">
                    {review}
                </CardDescription>
            </CardContent>
            <CardFooter>
                <div className="flex gap-2">
                    { 
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    }
                    <div className="flex flex-col ml-2">
                        <CardTitle className="text-sm font-semibold">{name}</CardTitle>
                        <CardDescription className="text-xs">{position}, {company}</CardDescription>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
