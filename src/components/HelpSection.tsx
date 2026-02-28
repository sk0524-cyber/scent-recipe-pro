import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface HelpItem {
  title: string;
  content: string;
}

interface HelpSectionProps {
  title: string;
  items: HelpItem[];
}

export function HelpSection({ title, items }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          {title}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="rounded-lg border bg-muted/40 p-4">
          <Accordion type="multiple" className="w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className={i === items.length - 1 ? 'border-b-0' : ''}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
