import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from 'react-router-dom';
import { Separator } from './ui/separator';

type ChatCardProps = {
    chatId: string;
    link: string;
    avatarSrc: string;
    fallbackText: string;
    title: string;
    subtitle: string;
};

const ChatCard: React.FC<ChatCardProps> = ({ chatId, link, avatarSrc, fallbackText, title, subtitle }) => (
    <div key={chatId} className="space-y-2">
        <Link to={link} className="py-4 px-4 bg-secondary flex items-center gap-4 hover:bg-background hover:cursor-pointer rounded-xl">
            <Avatar>
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{fallbackText}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-md font-semibold text-secondary-foreground">{title}</h2>
                <p className="text-sm font-medium text-secondary-foreground">{subtitle}</p>
            </div>
        </Link>
        <Separator />
    </div>
);

export default ChatCard;