import { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from "react-icons/md";

export default function Emoji({setText}: {setText:any}) {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleEmojiPicker = () => setIsOpen(!isOpen);
  const handleEmoji = (emojiData: EmojiClickData, event: MouseEvent) => {
    setText((prev:any) => prev + emojiData.emoji);
  }

  return (
    <span
      className="p-2 bg-secondary rounded-full cursor-pointer hover:bg-secondary-hover"
      onClick={toggleEmojiPicker}
    >
      <MdOutlineEmojiEmotions size={23} />
        <span className='absolute bottom-5 left-0'>
          <EmojiPicker open={isOpen} onEmojiClick={handleEmoji}/>
        </span>
    </span>
  );
}
