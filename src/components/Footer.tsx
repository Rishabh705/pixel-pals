import { Link } from "react-router-dom"
import { BsChatLeftTextFill } from "react-icons/bs";
import MaxWidthWrapper from "./MaxWidthWrapper";

export default function Footer() {
    return (
        <MaxWidthWrapper className="py-14">
            <div className="flex justify-between">
                <Link to='/' className='flex items-center gap-6'>
                    <h2 className='hidden md:block text-3xl text-primary font-bold font-comforta'>Pixel Pals</h2>
                    <BsChatLeftTextFill size={25} />
                </Link>
                <div className="flex gap-4 items-center">
                    <h4>About</h4>
                    <h4>Contact</h4>
                </div>
            </div>
            <div className="flex justify-between">
                <h3>Crafted with passion by RAZOR</h3>
                &copy; 2024-25 Pixel Pals. All rights reserved.
            </div>
        </MaxWidthWrapper>
    )
}
