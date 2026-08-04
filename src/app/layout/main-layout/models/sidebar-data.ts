export interface SidebarSubItem {
  title: string;
  url: string;
}

export interface SidebarNavigationItem {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items?: SidebarSubItem[];
}

export interface SidebarProject {
  name: string;
  url: string;
  icon: string;
}

export interface SidebarUser {
  name: string;
  email: string;
  initials: string;
}

export const sidebarData: {
  user: SidebarUser;
  navMain: SidebarNavigationItem[];
  navSecondary: SidebarNavigationItem[];
} = {
  user: {
    name: 'Hien Pham',
    email: 'hi@hien.page',
    initials: 'HP',
  },
  navMain: [
    {
      title: 'Performance',
      url: '.',
      icon: 'lucideGauge',
      isActive: true,
      items: [{ title: 'Virtual Scroll', url: '/virtual-scroll' }],
    },
  ],
  navSecondary: [
    { title: 'Support', url: '.', icon: 'lucideLifeBuoy' },
    { title: 'Feedback', url: '.', icon: 'lucideSend' },
  ],
};
