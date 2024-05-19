import MaxWidthWrapper from './MaxWidthWrapper';
import { Link } from 'react-router-dom';
import Hamburger from './Hamburger';
import { BsChatLeftTextFill } from "react-icons/bs";
import SpecialButton from './SpecialButton';

const Header = () => {
  return (
    <div className=' bg-background sticky z-50 top-0 inset-x-0'>
      <header className='relative'>
        <MaxWidthWrapper>
          <div className='flex flex-row items-center justify-between py-4 lg:py-6'>
            <Link to='/' className='flex items-center gap-6'>
              <h2 className='hidden md:block text-3xl text-primary font-bold font-comforta'>Pixel Pals</h2>
              <BsChatLeftTextFill size={25} />
            </Link>
            <div className='flex justify-between items-center gap-3 lg:gap-5'>
              <Link to='/' className='text-sm md:text-base text-foreground font-semibold'>
                Login
              </Link>
              <SpecialButton link='/' text='Get Started' className='hidden md:block' />
              <Hamburger className='' />
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Header;