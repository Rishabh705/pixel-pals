import AnimatedSVG from './AnimatedSVG';
import MaxWidthWrapper from './MaxWidthWrapper';
import SpecialButton from './SpecialButton';
import OptionsCards from './OptionsCards';
import { options } from '@/utils/constants';
import { Input } from './ui/input';
import { Button } from './ui/button';
import CustomAccordion from './CustomAccordion';
import { reviews } from "@/utils/constants"
import { ReviewCard } from './ReviewCard';

const ArrowRight = () => (
  <span className='ml-2'>
    &rarr;
  </span>
);

export default function Home() {

  const optionsCard = options.map(option => {
    return (
      <OptionsCards key={option.id} img={option.img} title={option.title} desc={option.desc} color={option.color} />
    )
  })
  const reviewCards = reviews.map(review => {
    return (
      <ReviewCard key={review.id} name={review.name} position={review.position} company={review.company} review={review.review}/>
    )
  })
  return (
    <>
      <MaxWidthWrapper>
        <div className='flex gap-4 py-20 max-h-screen'>
          <section className='md:w-2/3 lg:w-1/2'>
            <h1 className='text-4xl font-poppins lg:leading-tight font-bold tracking-tight text-gray-900 lg:text-5xl'>
              Let's Connect with Your Colleagues in Real Time
            </h1>
            <p className='mt-6 text-md max-w-prose text-muted-foreground'>
              An innovative app that offers seamless chat and collaborative whiteboard features, enabling you to connect and create effortlessly from any location.
            </p>
            <SpecialButton link='/' text='Start Chatting Now' Icon={ArrowRight} className=' mt-10' />
          </section>
          <section className='hidden lg:block flex-1 relative'>
            <AnimatedSVG />
            <div className='absolute'>

            </div>
          </section>
        </div>
      </MaxWidthWrapper>

      <MaxWidthWrapper className='bg-secondary py-14'>
        <h2 className='text-2xl font-poppins lg:leading-tight font-semibold tracking-tight text-gray-900 lg:text-3xl text-center mb-10'>Features for a better experience</h2>
        <div className='py-5 flex gap-4 justify-center flex-wrap md:px-5'>
          {optionsCard}
        </div>
        <h2 className='text-2xl pt-20 font-poppins lg:leading-tight font-semibold tracking-tight text-gray-900 lg:text-3xl text-center mb-10'>Experience that speaks volume</h2>
        <div className='pt-5 grid gap-x-3 gap-y-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6'>
          {reviewCards}
        </div>
      </MaxWidthWrapper>
      
      <MaxWidthWrapper className='bg-secondary py-14'>
        <div className='flex flex-col gap-8 lg:gap-1 lg:flex-row'>
          <div className='w-full lg:w-1/2 flex flex-col gap-3 '>
            <h3 className='text-md font-poppins font-medium lg:leading-tight tracking-tight text-gray-900 lg:text-lg'>FAQ</h3>
            <h2 className='text-2xl font-poppins lg:leading-tight font-semibold tracking-tight text-gray-900 lg:text-3xl'>Do you have any questions for us?</h2>
            <p className='text-md max-w-prose text-muted-foreground'>If there are question you want to ask. We will answer all your questions.</p>
            <div className='flex gap-2 max-w-md'>
              <Input placeholder='Enter your email' className='rounded-full' />
              <Button className='rounded-full px-6'>Submit</Button>
            </div>
          </div>
          <CustomAccordion/>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
