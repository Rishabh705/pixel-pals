import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function SpecialButton({ className, link, text, Icon }: { className?: string, link: string, text: string, Icon?: React.ElementType }) {
    return (
        <div className={cn(className)}>
            <Link
                to={link}
                className={cn(className, 'text-sm md:text-base text-foreground font-semibold text-white bg-gradient-to-br hover:bg-gradient-to-bl focus:ring-4 focus:outline-none text-center rounded-full px-5 py-2.5 lg:px-8 lg:py-3')}
            >
                {text}
                {Icon && <Icon />}
            </Link>
        </div>
    );
}
