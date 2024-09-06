import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from './ui/separator';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCloseSheets } from '@/rtk/slices/closeSheets';

type ChatCardProps = {
    chatId: string;
    link: string;
    avatarSrc: string;
    fallbackText: string;
    title: string;
    subtitle: string;
};

const ChatCard: React.FC<ChatCardProps> = ({ chatId, link, avatarSrc, fallbackText, title, subtitle }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const handleClick = () => {
       dispatch(setCloseSheets(false));
       navigate(link);
    };

    return (
        <div key={chatId} className="space-y-2">
            <div className="py-4 px-4 bg-secondary flex items-center gap-4 hover:bg-background hover:cursor-pointer rounded-xl" onClick={handleClick}>
                <Avatar>
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>{fallbackText}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-md font-semibold text-secondary-foreground">{title}</h2>
                    <p className="text-sm font-medium text-secondary-foreground">{subtitle.length > 35 ? `${subtitle.substring(0, 35)}...` : subtitle}</p>
                </div>
            </div>
            <Separator />
        </div>
    );
}


export default ChatCard;