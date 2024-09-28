import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from "react-icons/md";

export default function Emoji({setText, isOpen, setIsOpen}: {setText:any, isOpen:boolean, setIsOpen:any}) {
  const handleEmoji = (emojiData: EmojiClickData) => {
    setText((prev:any) => prev + emojiData.emoji);
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setIsOpen(true);
  }

  return (
    <span
      className="p-2 bg-secondary rounded-full cursor-pointer hover:bg-secondary-hover"
      onClick={handleClick}
      >
      <MdOutlineEmojiEmotions size={23} />
        <span className='absolute bottom-5 left-0'
        >
          <EmojiPicker open={isOpen} onEmojiClick={handleEmoji}/>
        </span>
    </span>
  );
}
