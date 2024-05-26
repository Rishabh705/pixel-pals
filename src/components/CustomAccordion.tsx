import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { personalHelp } from '@/lib/constants'

export default function CustomAccordion() {

    return (
        <Accordion type="single" collapsible className=" flex-1">
            {
                personalHelp.map((tab) =>
                (
                    <AccordionItem value={tab.id.toString()} key={tab.id}>
                        <AccordionTrigger>{tab.question}</AccordionTrigger>
                        <AccordionContent>
                            <h4 className=' text-accent-foreground font-medium mb-3'>
                               {tab.answer}
                            </h4>
                        </AccordionContent>
                    </AccordionItem>
                )
                )
            }

        </Accordion>
    )
}
