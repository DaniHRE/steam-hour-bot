'use client';

import {
  AtomIcon,
  Home,
  LogOut,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  icon: React.ElementType;
  id: string;
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    icon: Home,
    id: 'home',
  }
];

export default function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState<string>('home');

  return (
    <div className="flex flex-col justify-between min-h-screen w-[72px] bg-background p-4 border-r border-border">
      <div className="flex flex-col gap-8">
        <div className="flex h-[60px] items-center justify-center">
          <Button variant="ghost" className="h-auto p-2">
            ICONE
          </Button>
        </div>
      </div>

      <nav className="flex flex-col gap-8 items-center mt-4">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className="relative"
                  onClick={() => setActiveItem(item.id)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-lg bg-transparent ${isActive
                        ? 'text-primary text-base'
                        : 'text-foreground opacity-60 hover:opacity-100'
                      }`}
                  >
                    <item.icon className="!h-6 !w-6" />
                    <span className="sr-only">{item.title}</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-0 bg-background text-foreground"
              >
                {item.title}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="flex flex-col gap-6 items-center mt-4">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg bg-transparent text-foreground opacity-70 hover:opacity-100"
            >
              <LogOut className="!h-6 !w-6" />
              <span className="sr-only">Log out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="border-0 bg-background text-foreground"
          >
            Log out
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}