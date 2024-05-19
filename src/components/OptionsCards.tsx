import { cn } from "@/lib/utils"

export default function OptionsCards({ img, title, desc, color }:{img:string, title:string, desc:string, color:string}) {
    return (
        <div className="flex bg-card items-center py-5 px-4 gap-4 rounded-sm  w-full lg:w-[304px] border-2 border-border">
            <div className={cn(color,'rounded-full p-3')}>
                <img src={img} alt={title} width={22} className="max-w-12 h-auto" />
            </div>
            <div className="flex flex-col flex-grow">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-sm">{desc}</p>
            </div>
        </div>
    )
}
