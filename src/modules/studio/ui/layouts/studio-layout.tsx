import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { StudioSidebar } from '@/modules/studio/ui/components/studio-sidebar';
import { StudioNavbar } from '@/modules/studio/ui/components/studio-navbar';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      <div className='w-full'>
        <StudioNavbar />
        {/* home navbar의 높이 만큼, pt를 통해 밀어줌 */}
        <div className='flex min-h-screen pt-[4rem]'>
          <StudioSidebar />
          <main className='flex-1 overflow-y-auto'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
