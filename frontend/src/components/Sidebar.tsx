import {useNavigate, Link} from 'react-router-dom'
import {Home, Search, Settings, ChevronUp} from 'lucide-react'

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter,
} from '@/components/ui/sidebar'
import useGUser from '@/controllers/useGUser'

const entries = [{
  title: 'Items',
  url: '/',
  icon: Home,
}, {
  title: 'Search',
  url: '#',
  icon: Search,
}, {
  title: 'Settings',
  url: '#',
  icon: Settings,
}]

export const AppSidebar = () => {
  const navigate = useNavigate()
  const {user, logout} = useGUser()

  const onLogout = (evt: React.SyntheticEvent) => {
    evt.preventDefault()
    logout()
    void navigate('/login')
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {entries.map(e =>
              <SidebarMenuItem key={e.title}>
                <SidebarMenuButton asChild>
                  <a href={e.url}><e.icon />{e.title}</a>
                </SidebarMenuButton>
              </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!user ? <Link to="/login"
              className="text-blue-600 hover:underline">
              Login
            </Link> : <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {user.username}<ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top"
                className="min-w-[var(--radix-popper-anchor-width)]">
                <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
