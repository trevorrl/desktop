import React, { useMemo } from 'react';
import cx from 'classnames';
import { TAppPage } from 'services/navigation';
import { ENavName, EMenuItem, IMenuItem, IParentMenuItem } from 'services/side-nav';
import { EAvailableFeatures } from 'services/incremental-rollout';
import { $t } from 'services/i18n';
import { Services } from 'components-react/service-provider';
import { useVuex } from 'components-react/hooks';
import NavTools from './NavTools';
import styles from './SideNav.m.less';
import { Menu, Layout, Button } from 'antd';
import Scrollable from 'components-react/shared/Scrollable';

const { Sider } = Layout;

export default function SideNav() {
  const {
    AppService,
    CustomizationService,
    NavigationService,
    UserService,
    PlatformAppsService,
    IncrementalRolloutService,
    UsageStatisticsService,
    SideNavService,
    LayoutService,
  } = Services;

  function navigate(page: TAppPage, trackingTarget?: string) {
    if (!UserService.views.isLoggedIn && page !== 'Studio') return;

    if (trackingTarget) {
      UsageStatisticsService.actions.recordClick('SideNav', trackingTarget);
    }
    NavigationService.actions.navigate(page);
    LayoutService.actions.setCurrentTab(page as string);
  }

  function navigateApp(appId: string) {
    NavigationService.actions.navigate('PlatformAppMainPage', { appId });
    LayoutService.actions.setCurrentTab(appId);
  }

  function navigateToStudioTab(tabId: string, trackingTarget: string) {
    NavigationService.actions.navigate('Studio', { trackingTarget });
    LayoutService.actions.setCurrentTab(tabId);
  }

  function iconSrc(appId: string, path: string) {
    return PlatformAppsService.views.getAssetUrl(appId, path) || undefined;
  }

  const {
    featureIsEnabled,
    currentPage, // TODO: tracking & styling for currentPage
    tabs,
    leftDock,
    enabledApps,
    loggedIn,
    menu,
    isOpen,
    openMenuItems,
    expandMenuItem,
    hasLegacyMenu,
  } = useVuex(() => ({
    featureIsEnabled: (feature: EAvailableFeatures) =>
      IncrementalRolloutService.views.featureIsEnabled(feature),
    currentPage: NavigationService.state.currentPage,
    tabs: LayoutService.state.tabs,
    leftDock: CustomizationService.state.leftDock,
    loading: AppService.state.loading,
    enabledApps: PlatformAppsService.views.enabledApps,
    loggedIn: UserService.views.isLoggedIn,
    menu: SideNavService.views.state[ENavName.TopNav],
    isOpen: SideNavService.views.isOpen,
    openMenuItems: SideNavService.views.getExpandedMenuItems(ENavName.TopNav),
    expandMenuItem: SideNavService.actions.expandMenuItem,
    hasLegacyMenu: SideNavService.views.hasLegacyMenu,
  }));

  const menuItems = useMemo(() => {
    if (!loggedIn) {
      menu.menuItems.map(menuItem => {
        if (menuItem.title !== EMenuItem.Editor) {
          return { ...menuItem, isActive: false };
        }
        return menuItem;
      });
    } else if (loggedIn && !hasLegacyMenu) {
      menu.menuItems.map(menuItem => {
        if (
          ![EMenuItem.Editor, EMenuItem.Themes, EMenuItem.AppStore, EMenuItem.Highlighter].includes(
            menuItem.title as EMenuItem,
          )
        ) {
          return { ...menuItem, isActive: false };
        }
        return menuItem;
      });
    }
    return menu.menuItems;
  }, [menu, loggedIn, hasLegacyMenu]);

  const studioTabs = Object.keys(tabs).map((tab, i) => ({
    target: tab,
    title: i === 0 || !tabs[tab].name ? $t('Editor') : tabs[tab].name,
    icon: tabs[tab].icon,
    trackingTarget: tab === 'default' ? 'editor' : 'custom',
  }));

  /*
   * Theme audit will only ever be enabled on individual accounts or enabled
   * via command line flag. Not for general use.
   */
  const themeAuditEnabled = featureIsEnabled(EAvailableFeatures.themeAudit);

  console.log('SIDENAV COMPONENT: menu', menu);

  return (
    <Layout
      hasSider
      style={{
        width: '100%',
        minHeight: '100vh',
      }}
      className="sidenav"
    >
      <Sider
        collapsible
        collapsed={!isOpen}
        trigger={null}
        className={cx(styles.sidenavSider, !isOpen && styles.siderClosed)}
      >
        <Scrollable
          snapToWindowEdge
          className={cx(styles.sidenavScroll, { [styles.leftDock]: leftDock })}
        >
          <Menu
            forceSubMenuRender
            mode="inline"
            className={cx(styles.menuContainer, !isOpen && styles.siderClosed)}
            defaultOpenKeys={openMenuItems && openMenuItems}
          >
            {menuItems.map((menuItem: IParentMenuItem) => {
              if (
                !menuItem?.isActive ||
                (menuItem?.isLegacy && !hasLegacyMenu) ||
                (menuItem.title === EMenuItem.ThemeAudit && !themeAuditEnabled)
              ) {
                // skip inactive menu items
                // skip legacy menu items for new users
                // skip Theme Audit if not enabled
                return null;
              } else if (menuItem.title === EMenuItem.Editor && studioTabs.length > 0) {
                // if legacy menu, show editor tabs in sidenav
                // otherwise, show editor tabs in submenu
                // don't translate tab title because the user has set it
                return hasLegacyMenu ? (
                  studioTabs.map(tab => (
                    <Menu.Item
                      key={tab.title}
                      title={tab.title}
                      icon={<i className={tab.icon} />}
                      onClick={() => {
                        navigateToStudioTab(tab.target, tab.trackingTarget);
                        console.log('clicked tab');
                      }}
                    >
                      {tab.title}
                    </Menu.Item>
                  ))
                ) : (
                  <Menu.SubMenu
                    key={menuItem.title}
                    title={$t(menuItem.title)}
                    icon={menuItem?.icon && <i className={menuItem.icon} />}
                    onTitleClick={() => {
                      expandMenuItem(ENavName.TopNav, menuItem.title as EMenuItem);
                    }}
                  >
                    {studioTabs.map(tab => (
                      <Menu.Item
                        key={`tab-${tab.title}`}
                        title={tab.title}
                        icon={<i className={tab.icon} />}
                        onClick={() => {
                          navigateToStudioTab(tab.target as TAppPage, tab.trackingTarget);
                          console.log('clicked tab');
                        }}
                      >
                        {tab.title}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                );
              } else if (menuItem.title === EMenuItem.AppStore) {
                return (
                  <Menu.SubMenu
                    key={menuItem.title}
                    title={$t(menuItem.title)}
                    icon={menuItem?.icon && <i className={menuItem.icon} />}
                    onTitleClick={() => {
                      expandMenuItem(ENavName.TopNav, menuItem.title as EMenuItem);
                    }}
                  >
                    <Menu.Item
                      key={`sub-${menuItem.title}`}
                      title={$t(menuItem?.subMenuItems[0]?.title)}
                      onClick={() =>
                        menuItem?.target
                          ? navigate(menuItem?.target as TAppPage, menuItem?.trackingTarget)
                          : console.log('target tbd')
                      }
                    >
                      {$t(menuItem?.subMenuItems[0]?.title)}
                    </Menu.Item>
                    {enabledApps.map(app => (
                      <Menu.Item
                        key={app.id}
                        title={app.manifest.name}
                        onClick={() => navigateApp(app.id)}
                      >
                        {app.manifest.name}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                );
              } else {
                // otherwise, show a menu item or a menu item with a submenu
                return menuItem.hasOwnProperty('subMenuItems') ? (
                  <Menu.SubMenu
                    key={menuItem.title}
                    title={$t(menuItem.title)}
                    icon={menuItem?.icon && <i className={menuItem.icon} />}
                    onTitleClick={() => {
                      expandMenuItem(ENavName.TopNav, menuItem.title as EMenuItem);
                      // if (menuItem.hasOwnProperty('isToggled') || menuItem?.target) {
                      //   navigate(menuItem.target as TAppPage, menuItem?.trackingTarget);
                      // }
                    }}
                  >
                    {/* {menuItem.title === EMenuItem.Themes && console.log('----- THEME')} */}
                    {menuItem?.subMenuItems?.map((subMenuItem: IMenuItem, index: number) => (
                      <Menu.Item
                        key={`sub-${subMenuItem.title}`}
                        title={$t(subMenuItem.title)}
                        onClick={() =>
                          menuItem?.target &&
                          navigate(menuItem?.target as TAppPage, menuItem?.trackingTarget)
                        }
                      >
                        {$t(subMenuItem.title)}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item
                    key={menuItem.title}
                    title={$t(menuItem.title)}
                    icon={menuItem?.icon && <i className={menuItem.icon} />}
                    onClick={() => {
                      menuItem?.target &&
                        navigate(menuItem?.target as TAppPage, menuItem?.trackingTarget);
                    }}
                  >
                    {$t(menuItem.title)}
                  </Menu.Item>
                );
              }
            })}
            {hasLegacyMenu && enabledApps.length > 0 && (
              // if legacy menu, apps can also be seen in the sidebar
              // below the regular menu items
              <>
                {enabledApps.map(app => (
                  <Menu.Item
                    key={app.id}
                    title={$t(app.manifest.name)}
                    icon={
                      app.manifest.icon ? (
                        <img
                          src={iconSrc(app.id, app.manifest.icon)}
                          style={{ width: '16px', height: '16px' }}
                        />
                      ) : (
                        <i className="icon-integrations" />
                      )
                    }
                    onClick={() => navigateApp(app.id)}
                  >
                    {app.manifest.name}
                  </Menu.Item>
                ))}
              </>
            )}
          </Menu>

          {/* show the bottom navigation menu */}
          <NavTools />
        </Scrollable>
      </Sider>

      {/* this button toggles the menu open and close */}
      <Button
        type="primary"
        className={cx(styles.sidenavButton, !isOpen && styles.flipped)}
        onClick={() => SideNavService.actions.toggleMenuStatus()}
      >
        <i className="icon-back" />
      </Button>
    </Layout>
  );
}
