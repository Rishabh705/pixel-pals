import { Link } from 'react-router-dom';
import { BsChatLeftTextFill } from "react-icons/bs";
import MaxWidthWrapper from './MaxWidthWrapper';
import Profile from './Profile';

const Header = () => {
  return (
    <header className='bg-background sticky top-0 inset-x-0 z-50 shadow-md'>
      <MaxWidthWrapper>
        <div className='flex items-center justify-between py-4 lg:py-6'>
          <Link to='/' className='flex items-center gap-6'>
            <h2 className='hidden md:block text-3xl text-primary font-bold font-comforta'>Pixel Pals</h2>
            <BsChatLeftTextFill size={25} />
          </Link>
          <Profile />
        </div>
      </MaxWidthWrapper>
    </header>
  );
};

export default Header;
