import { GiHamburgerMenu } from "react-icons/gi";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from 'react-router-dom';
import { IoMdPerson, IoMdBusiness, IoIosHelpCircle } from "react-icons/io";
import { MdDeveloperMode } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { cn } from "@/lib/utils";

export default function Hamburger({ className }: { className: string }) {
    return (
        <Sheet>
            <SheetTrigger className={cn(className, 'flex lg:hidden')}>
                <GiHamburgerMenu color='#1a1a1a' size={30} />
            </SheetTrigger>
            <SheetContent>
                <SheetHeader className='mt-6 flex flex-col gap-4'>
                    <div className='flex flex-col'>
                        <div className='flex gap-4 pr-6  h-full pt-2 pb-2 border-b-2'>
                            <SheetTitle>Menu</SheetTitle>
                        </div>
                    </div>
                </SheetHeader>
                <nav className='mt-4 flex flex-col'>
                    <Link to='/' className='text-lg font-medium hover:bg-slate-100 py-2'>
                        <section className='flex items-center gap-3'>
                            <IoMdPerson />
                            <div className='flex-1 flex justify-between items-center'>
                                <h2>Personal</h2>
                                <FaAngleRight />
                            </div>
                        </section>
                    </Link>
                    <Link to='/' className='text-lg font-medium hover:bg-slate-100 py-2'>
                        <section className='flex items-center gap-3'>
                            <IoMdBusiness />
                            <div className='flex-1 flex justify-between items-center'>
                                <h2>Business</h2>
                                <FaAngleRight />
                            </div>
                        </section>
                    </Link>
                    <Link to='/' className='text-lg font-medium hover:bg-slate-100 py-2'>
                        <section className='flex items-center gap-3'>
                            <MdDeveloperMode />
                            <div className='flex-1 flex justify-between items-center'>
                                <h2>Developer</h2>
                                <FaAngleRight />
                            </div>
                        </section>
                    </Link>
                    <Link to='/' className='text-lg font-medium hover:bg-slate-100 py-2'>
                        <section className='flex items-center gap-3'>
                            <IoIosHelpCircle />
                            <div className='flex-1 flex justify-between items-center'>
                                <h2>Help</h2>
                                <FaAngleRight />
                            </div>
                        </section>
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    )
}
