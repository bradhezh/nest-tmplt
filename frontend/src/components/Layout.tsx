import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar'
import {AppSidebar} from './Sidebar'

export const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}

export default Layout
