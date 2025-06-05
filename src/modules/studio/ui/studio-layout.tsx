import { SidebarProvider } from '@/components/ui/sidebar';
import { StudioNavbar } from '../components/studio-navbar';
import React from 'react';
import { StudioSidebar } from '@/modules/studio/components/studio-sidebar';

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
