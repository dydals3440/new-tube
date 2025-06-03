import { SidebarProvider } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/modules/home/ui/components/home-sidebar';
import { HomeNavbar } from '../components/home-navbar';
import React from 'react';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className='w-full'>
        <HomeNavbar />
        {/* home navbar의 높이 만큼, pt를 통해 밀어줌 */}
        <div className='flex min-h-screen pt-[4rem]'>
          <HomeSidebar />
          <main className='flex-1 overflow-y-auto'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
