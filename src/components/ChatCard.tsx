import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from './ui/separator';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCloseSheets } from '@/rtk/slices/closeSheets';
import { decryptData } from '@/lib/helpers';

type ChatCardProps = {
    chatId: string;
    link: string;
    avatarSrc: string;
    fallbackText: string;
    title: string;
    lastMessage: string;
    side: "sender" | "receiver"
};

const ChatCard: React.FC<ChatCardProps> = ({ chatId, link, avatarSrc, fallbackText, title, lastMessage, side }) => {
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useDispatch();
    const [subtitle, setSubtitle] = useState<string>("");

    const handleClick = () => {
        dispatch(setCloseSheets(false));
        navigate(link);
    };

    useEffect(() => {
        const decryptMessage = async () => {
            const decryptedText = await decryptData(lastMessage, side);
            setSubtitle(decryptedText);
        };
        decryptMessage();
    }, [lastMessage]);

    const displaySubtitle = () => {
        if (!lastMessage) {
            return "Start Conversation";
        } else if (subtitle) {
            return side === 'sender' ? `You: ${subtitle}` : `${title}: ${subtitle}`;
        }
        return '';
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
                    <p className="text-sm font-medium text-secondary-foreground">
                        {displaySubtitle().length > 35 ? `${displaySubtitle().substring(0, 35)}...` : displaySubtitle()}
                    </p>
                </div>
            </div>
            <Separator />
        </div>
    );
}


export default ChatCard;