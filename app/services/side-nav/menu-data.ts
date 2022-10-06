import { TAppPage } from 'services/navigation';

type TExternalLinks = 'cloudbot' | 'alertbox' | 'widgets' | 'tipping' | 'multistream';

export interface IAppMenu {
  id?: string;
  name?: string;
  isActive: boolean;
  icon?: string;
}
export interface IMenu {
  name: string;
  isOpen: boolean;
  isLegacy?: boolean; // Users created after sidebar navigation refactor will see fewer menu items
  menuItems: (IMenuItem | IParentMenuItem)[];
}

export interface IMenuItem {
  target?: TAppPage | 'NavTools' | 'WidgetWindow' | TExternalLinks; // optional because menu item could be a toggle
  title: string;
  trackingTarget?: string;
  icon?: string;
  isLegacy?: boolean;
  isExpanded: boolean;
  isActive?: boolean;
}

export interface IParentMenuItem extends IMenuItem {
  isToggled?: boolean;
  isEditor?: boolean;

  subMenuItems: IMenuItem[];
}

export enum ENavName {
  TopNav = 'top-nav',
  BottomNav = 'bottom-nav',
}

export enum EMenuItem {
  Editor = 'Editor',
  LayoutEditor = 'Layout Editor',
  StudioMode = 'Studio Mode',
  Themes = 'Themes',
  AppStore = 'App Store',
  Highlighter = 'Highlighter',
  ThemeAudit = 'Theme Audit',
  DevTools = 'Dev Tools',
  GetPrime = 'Get Prime',
  Dashboard = 'Dashboard',
  GetHelp = 'Get Help',
  Settings = 'Settings',
  Login = 'Login',
}

export enum ESubMenuItem {
  Scene = 'Scene',
  Widget = 'Widget',
  TipPage = 'Tip Page',
  AppsManager = 'Apps Manager',
  Cloudbot = 'Cloudbot',
  AlertBox = 'Alert Box',
  Widgets = 'Widgets',
  TipSettings = 'Tip Settings',
  Multistream = 'Multistream',
}

export const SideBarTopNavData = (): IMenu => ({
  name: ENavName.TopNav,
  isOpen: false, // TODO: update to be set by user settings on layout load
  isLegacy: true, // TODO: update to be set by user creation date
  menuItems: [
    SideNavMenuItems()[EMenuItem.Editor],
    SideNavMenuItems()[EMenuItem.LayoutEditor],
    SideNavMenuItems()[EMenuItem.StudioMode],
    SideNavMenuItems()[EMenuItem.Themes],
    SideNavMenuItems()[EMenuItem.AppStore],
    SideNavMenuItems()[EMenuItem.Highlighter],
    SideNavMenuItems()[EMenuItem.ThemeAudit],
  ],
});

export const SideBarBottomNavData = (): IMenu => ({
  name: ENavName.BottomNav,
  isOpen: false, // TODO: update to be set by user settings on layout load
  isLegacy: true, // TODO: update to be set by user creation date
  menuItems: [
    SideNavMenuItems()[EMenuItem.DevTools],
    SideNavMenuItems()[EMenuItem.GetPrime],
    SideNavMenuItems()[EMenuItem.Dashboard],
    SideNavMenuItems()[EMenuItem.GetHelp],
    SideNavMenuItems()[EMenuItem.Settings],
    SideNavMenuItems()[EMenuItem.Login],
  ],
});

export type TNavMenu = {
  [Nav in ENavName]: IMenu;
};

export const SideNavMenu = (): TNavMenu => ({
  [ENavName.TopNav]: SideBarTopNavData(),
  [ENavName.BottomNav]: SideBarBottomNavData(),
});

export type TMenuItems = {
  [MenuItem in EMenuItem]: IMenuItem | IParentMenuItem;
};

export const SideNavMenuItems = (): TMenuItems => ({
  [EMenuItem.Editor]: {
    target: 'Studio',
    title: EMenuItem.Editor,
    trackingTarget: 'editor',
    icon: 'icon-studio',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
    isEditor: true, // if true, will show themes in bar when minimized
    // if the user has themes, they will be listed in a subMenuItems property. The trackingTarget is 'custom' e.g: tab === 'default' ? 'editor' : 'custom'
  },
  [EMenuItem.LayoutEditor]: {
    target: 'LayoutEditor',
    title: EMenuItem.LayoutEditor,
    trackingTarget: 'layout-editor',
    icon: 'fas fa-th-large',
    // isActive: false,
    isLegacy: true,
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },
  [EMenuItem.StudioMode]: {
    target: 'Studio',
    title: EMenuItem.StudioMode,
    trackingTarget: 'studio-mode',
    icon: 'icon-studio-mode-3',
    // isActive: false,
    isLegacy: true,
    isToggled: false, // toggles
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },
  [EMenuItem.Themes]: {
    target: 'BrowseOverlays',
    title: EMenuItem.Themes,
    trackingTarget: 'themes', // maybe required?
    // isActive: false, // maybe track in MenuStatus
    icon: 'icon-themes',
    subMenuItems: [
      SideBarSubMenuItems()[ESubMenuItem.Scene],
      SideBarSubMenuItems()[ESubMenuItem.AlertBox],
      SideBarSubMenuItems()[ESubMenuItem.Widget],
      SideBarSubMenuItems()[ESubMenuItem.TipPage],
    ],
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },

  [EMenuItem.AppStore]: {
    title: EMenuItem.AppStore,
    icon: 'icon-store',
    // isActive: false,
    subMenuItems: [SideBarSubMenuItems()[ESubMenuItem.AppsManager]],
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },
  // apps here. ...enabledApps.map(app => app.id)]
  [EMenuItem.Highlighter]: {
    target: 'Highlighter',
    icon: 'icon-highlighter',
    title: EMenuItem.Highlighter,
    trackingTarget: 'highlighter',
    // isActive: false,
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },
  [EMenuItem.ThemeAudit]: {
    target: 'ThemeAudit',
    icon: 'fas fa-exclamation-triangle',
    title: EMenuItem.ThemeAudit,
    trackingTarget: 'themeaudit',
    // isActive: false,
    isActive: true, // true for now for coding purposes
    isExpanded: false,
  },
  [EMenuItem.DevTools]: {
    title: EMenuItem.DevTools,
    trackingTarget: 'editor',
    icon: 'icon-developer',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
  },
  [EMenuItem.GetPrime]: {
    title: EMenuItem.GetPrime,
    icon: 'icon-prime',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
  },
  [EMenuItem.Dashboard]: {
    title: EMenuItem.Dashboard,
    icon: 'icon-dashboard',
    isLegacy: false,
    isActive: true,
    subMenuItems: [
      SideBarSubMenuItems()[ESubMenuItem.Cloudbot],
      SideBarSubMenuItems()[ESubMenuItem.AlertBox],
      SideBarSubMenuItems()[ESubMenuItem.Widgets],
      SideBarSubMenuItems()[ESubMenuItem.TipSettings],
      SideBarSubMenuItems()[ESubMenuItem.Multistream],
    ],
    isExpanded: false,
  },
  [EMenuItem.GetHelp]: {
    title: EMenuItem.GetHelp,
    icon: 'icon-question',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
  },
  [EMenuItem.Settings]: {
    title: EMenuItem.Settings,
    icon: 'icon-settings',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
  },
  [EMenuItem.Login]: {
    title: EMenuItem.Login,
    icon: 'icon-user',
    isLegacy: false,
    isActive: true,
    isExpanded: false,
  },
});

type TSubMenuItems = {
  [MenuItem in ESubMenuItem]: IMenuItem | IParentMenuItem;
};

export const SideBarSubMenuItems = (): TSubMenuItems => ({
  [ESubMenuItem.Scene]: {
    target: 'BrowseOverlays', // to the scene tab
    title: ESubMenuItem.Scene,
    isExpanded: false,
  },
  [ESubMenuItem.Widget]: {
    target: 'WidgetWindow',
    title: ESubMenuItem.Widget,
    isExpanded: false,
  },
  [ESubMenuItem.TipPage]: {
    // target: 'Tip Page', TODO: where does this go?
    title: ESubMenuItem.TipPage,
    isExpanded: false,
  },
  [ESubMenuItem.AppsManager]: {
    target: 'PlatformAppMainPage', // to the My Apps tab in Profile?
    title: ESubMenuItem.AppsManager,
    trackingTarget: 'app-store',
    isExpanded: false,
  },
  [ESubMenuItem.Cloudbot]: {
    target: 'cloudbot',
    title: ESubMenuItem.Cloudbot,
    isLegacy: false,
    isExpanded: false,
  },
  [ESubMenuItem.AlertBox]: {
    target: 'AlertboxLibrary',
    title: ESubMenuItem.AlertBox,
    trackingTarget: 'alertbox-library',
    isExpanded: false,
  },
  [ESubMenuItem.Widgets]: {
    target: 'widgets',
    title: ESubMenuItem.Widgets,
    isExpanded: false,
  },
  [ESubMenuItem.TipSettings]: {
    target: 'tipping',
    title: ESubMenuItem.TipSettings,
    isExpanded: false,
  },
  [ESubMenuItem.Multistream]: {
    target: 'multistream',
    title: ESubMenuItem.Multistream,
    isExpanded: false,
  },
});
