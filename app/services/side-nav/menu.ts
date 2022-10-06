import { ViewHandler, InitAfter, PersistentStatefulService } from 'services/core';
import { mutation } from 'services/core/stateful-service';
import {
  TMenuItems,
  EMenuItem,
  IMenuItem,
  SideNavMenuItems,
  ENavName,
  IMenu,
  IAppMenu,
  SideBarTopNavData,
  SideBarBottomNavData,
} from './menu-data';

interface ISideNavServiceState {
  isOpen: boolean;
  hasLegacyMenu: boolean;
  compactView: boolean;
  menuItems: TMenuItems;
  displayedApps: IAppMenu[]; // array with app info
  [ENavName.TopNav]: IMenu;
  [ENavName.BottomNav]: IMenu;
}

class SideNavViews extends ViewHandler<ISideNavServiceState> {
  get isOpen() {
    return this.state.isOpen;
  }

  get compactView() {
    return this.state.compactView;
  }

  get menuItems() {
    return this.state.menuItems;
  }

  get hasLegacyMenu() {
    return this.state.hasLegacyMenu;
  }

  get displayedApps() {
    return this.state.displayedApps;
  }

  getMenuItem(name: EMenuItem) {
    if (!name) return;
    return this.state.menuItems[name];
  }

  isMenuItemActive(name: EMenuItem) {
    if (!name) return;
    return this.state.menuItems[name].isActive;
  }

  getExpandedMenuItems(name: ENavName) {
    if (!name) return;
    return this.state[name].menuItems.reduce((keys, menuItem: IMenuItem) => {
      if (menuItem.isExpanded) {
        keys.push(menuItem.title as string);
      }
      return keys;
    }, []);
  }
}

@InitAfter('UserService')
export class SideNavService extends PersistentStatefulService<ISideNavServiceState> {
  static defaultState: ISideNavServiceState = {
    isOpen: false,
    hasLegacyMenu: true, // TODO: true for now, set to false and then update based off of user creation date
    compactView: true,
    menuItems: SideNavMenuItems(),
    displayedApps: Array(5), // only allow the user to have 5 apps displayed in menu
    [ENavName.TopNav]: SideBarTopNavData(),
    [ENavName.BottomNav]: SideBarBottomNavData(),
  };

  init() {
    super.init();
  }

  get views() {
    return new SideNavViews(this.state);
  }

  toggleMenuStatus() {
    this.OPEN_CLOSE_MENU();
  }

  setCompactView() {
    this.SET_COMPACT_VIEW();
  }

  expandMenuItem(navName: ENavName, menuItemName: EMenuItem) {
    // expand/contract menu items
    this.EXPAND_MENU_ITEM(navName, menuItemName);
  }

  toggleMenuItem(navName: ENavName, menuItemName: EMenuItem) {
    // show/hide menu items
    this.TOGGLE_MENU_ITEM(navName, menuItemName);
  }

  toggleApp(index: number) {
    // show hide apps in menu
    this.TOGGLE_APP(index);
  }

  swapApp(app: IAppMenu, index: number) {
    this.SWAP_APP(app, index);
  }

  hideApp(index: number) {
    this.HIDE_APP(index);
  }

  @mutation()
  private OPEN_CLOSE_MENU() {
    this.state.isOpen = !this.state.isOpen;
  }

  @mutation()
  private SET_COMPACT_VIEW() {
    this.state.compactView = !this.state.compactView;
    Object.keys(this.state.menuItems).forEach((menuName: EMenuItem) => {
      if (
        [EMenuItem.Editor, EMenuItem.Themes, EMenuItem.AppStore, EMenuItem.Highlighter].includes(
          menuName,
        )
      ) {
        this.state.menuItems[menuName].isActive = true;
      } else {
        this.state.menuItems[menuName].isActive = false;
      }
    });
    console.log('this.state after compact ', this.state);
  }

  @mutation()
  private TOGGLE_MENU_ITEM(navName: ENavName, menuItemName: EMenuItem) {
    // find menu item and set to the opposite of current state
    this.state[navName].menuItems.find(
      (menuItem: IMenuItem) => menuItem.title === menuItemName,
    ).isActive = !this.state[navName].menuItems.find(
      (menuItem: IMenuItem) => menuItem.title === menuItemName,
    ).isActive;

    // find menu item in object used for toggling custom navigation settings
    this.state.menuItems[menuItemName].isActive = !this.state.menuItems[menuItemName].isActive;
  }

  @mutation()
  private TOGGLE_APP(index: number) {
    console.log('TOGGLE APP');
    this.state.displayedApps[index].isActive = !this.state.displayedApps[index].isActive;
  }

  @mutation()
  private HIDE_APP(index: number) {
    console.log('HIDING');
    this.state.displayedApps = [...this.state.displayedApps.splice(index, 1, null)];
  }

  @mutation()
  private SWAP_APP(app: IAppMenu, index: number) {
    console.log('SHOWING');
    this.state.displayedApps[index] = app;
  }

  @mutation()
  private EXPAND_MENU_ITEM(navName: ENavName, menuItemName: EMenuItem) {
    // find menu item and set to the opposite of current state
    console.log('navName ', navName);
    console.log('menuItemName ', menuItemName);
    console.log(
      'before this.state[navName].menuItems.find( ',
      this.state[navName].menuItems.find((menuItem: IMenuItem) => menuItem.title === menuItemName),
    );
    this.state[navName].menuItems.find(
      (menuItem: IMenuItem) => menuItem.title === menuItemName,
    ).isExpanded = !this.state[navName].menuItems.find(
      (menuItem: IMenuItem) => menuItem.title === menuItemName,
    ).isExpanded;

    console.log(
      'after ',
      this.state[navName].menuItems.find((menuItem: IMenuItem) => menuItem.title === menuItemName)
        .isExpanded,
    );
  }
}
