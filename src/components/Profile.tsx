import { CgProfile } from "react-icons/cg"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { LuLogOut } from "react-icons/lu"
import { Link, NavigateFunction, useNavigate } from "react-router-dom"
import SpecialButton from "./SpecialButton";
import Hamburger from './Hamburger';
import { logoutUser } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { logout } from "@/rtk/slices/authSlice";
import { AuthState } from "@/utils/types";
import { isTokenExpired } from "@/lib/jwt";

export default function Profile() {
    let token:(string|null) = useAppSelector(state => state.auth.accessToken)
    const localstorage = localStorage.getItem('loggedin')

    if (localstorage) {
        const authData: AuthState = JSON.parse(localstorage);
        
        // If the token in Redux state is null, use the one from local storage
        if (!token && authData.accessToken) {
            token = authData.accessToken;
        }
    }

    const isLogged: boolean = token!==null && !isTokenExpired(token);

    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch()
    const authData: AuthState = useAppSelector(state => state.auth)

    const handleLogout: () => void = async () => {
        try{
            await logoutUser();
            dispatch(logout())
            localStorage.removeItem('loggedin')            
            navigate('/');
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("An unknown error occurred", error);
            }
        }
    }
    return (
        <div>
            {
                isLogged ? (
                    <Sheet>
                        <SheetTrigger>
                            <CgProfile size={25} color='#36454F' />
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader className='mt-6 flex flex-col gap-4'>
                                <div className='flex flex-col items-start'>
                                    <SheetTitle>{authData?.username || 'RAZOR'}</SheetTitle>
                                    <p>{authData?.email || 'razor47@hitman.com'}</p>
                                </div>
                                <div className='flex flex-col'>
                                    {/* <div className='flex gap-4 pr-6 hover:bg-slate-200 h-full pt-2 pb-2'>
                                        <IoMdHeart size={22} />
                                        <Link to='/' className="flex-1 flex justify-between">
                                            Liked articles
                                            <p>0</p>
                                        </Link>
                                    </div> */}
                                    <span className="flex items-center gap-2 cursor-pointer" onClick={handleLogout}>
                                        <LuLogOut size={22} />
                                        <button>Logout</button>
                                    </span>
                                </div>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                ) : (
                    <div className='flex justify-between items-center gap-3 lg:gap-5'>
                        <Link to='/login' className='text-sm md:text-base text-foreground font-semibold'>
                            Login
                        </Link>
                        <SpecialButton link='/register' text='Get Started' className='hidden md:block from-orange-600 to-orange-300 focus:ring-pink-200 dark:focus:ring-pink-800' />
                        <Hamburger className='' />
                    </div>
                )
            }
        </div>
    )
}
