import React, { useMemo } from 'react';
import { Services } from '../../service-provider';
import { $t } from '../../../services/i18n';
import { Row, Col, Select } from 'antd';
import { CheckboxInput, ListInput, SliderInput, SwitchInput } from '../../shared/inputs';
import { getDefined } from '../../../util/properties-type-guards';
import { ObsSettingsSection } from './ObsSettings';
import * as remote from '@electron/remote';
import { injectFormBinding, useModule } from 'slap';
import { ENavName, EMenuItem, IMenuItem, IParentMenuItem, TMenuItems } from 'services/side-nav';
import { useVuex } from 'components-react/hooks';
import styles from './Appearance.m.less';
import cx from 'classnames';
import { EAppPageSlot, ILoadedApp } from 'services/platform-apps';
import Scrollable from 'components-react/shared/Scrollable';

const { Option } = Select;

export function AppearanceSettings() {
  const {
    CustomizationService,
    WindowsService,
    UserService,
    MagicLinkService,
    SideNavService,
    PlatformAppsService,
  } = Services;

  const { bind } = useModule(() => {
    function getSettings() {
      return CustomizationService.state;
    }

    function setSettings(newSettings: typeof CustomizationService.state) {
      CustomizationService.actions.setSettings(newSettings);
    }

    return { bind: injectFormBinding(getSettings, setSettings) };
  });

  const {
    compactView,
    menuItems,
    apps,
    displayedApps,
    toggleApp,
    swapApp,
    hideApp,
    toggleMenuItem,
    setCompactView,
  } = useVuex(() => ({
    compactView: SideNavService.views.compactView,
    menuItems: SideNavService.views.menuItems,
    apps: PlatformAppsService.views.enabledApps.filter(app => {
      return !!app.manifest.pages.find(page => {
        return page.slot === EAppPageSlot.TopNav;
      });
    }),
    displayedApps: SideNavService.views.displayedApps,
    toggleApp: SideNavService.actions.toggleApp,
    swapApp: SideNavService.actions.swapApp,
    hideApp: SideNavService.actions.hideApp,
    toggleMenuItem: SideNavService.actions.toggleMenuItem,
    setCompactView: SideNavService.actions.setCompactView,
  }));

  console.log('displayedApps ', displayedApps);

  function openFFZSettings() {
    WindowsService.createOneOffWindow(
      {
        componentName: 'FFZSettings',
        title: $t('FrankerFaceZ Settings'),
        queryParams: {},
        size: {
          width: 800,
          height: 800,
        },
      },
      'ffz-settings',
    );
  }

  async function upgradeToPrime() {
    const link = await MagicLinkService.getDashboardMagicLink('prime-marketing', 'slobs-ui-themes');
    remote.shell.openExternal(link);
  }

  /**
   * Sort apps
   */

  const existingApps = displayedApps.filter(app => !!app);

  console.log('existingApps', existingApps);
  const appData = apps.map(app => ({
    id: app.id,
    name: app.manifest.name,
    icon: app.manifest.icon,
    isActive: true,
  }));

  const shouldShowPrime = UserService.views.isLoggedIn && !UserService.views.isPrime;
  const shouldShowEmoteSettings =
    UserService.views.isLoggedIn && getDefined(UserService.platform).type === 'twitch';

  return (
    <div>
      <ObsSettingsSection>
        <ListInput {...bind.theme} label={'Theme'} options={CustomizationService.themeOptions} />
        {shouldShowPrime && (
          <div style={{ marginBottom: '16px' }}>
            <a style={{ color: 'var(--prime)' }} onClick={upgradeToPrime}>
              <i style={{ color: 'var(--prime)' }} className="icon-prime" />
              {$t('Change the look of Streamlabs Desktop with Prime')}
            </a>
          </div>
        )}
      </ObsSettingsSection>

      <ObsSettingsSection title={$t('Chat Settings')}>
        <CheckboxInput
          {...bind.leftDock}
          label={$t('Show the live dock (chat) on the left side')}
        />
        <SliderInput
          {...bind.chatZoomFactor}
          label={$t('Text Size')}
          tipFormatter={(val: number) => `${val * 100}%`}
          min={0.25}
          max={2}
          step={0.25}
        />

        {shouldShowEmoteSettings && (
          <div>
            <CheckboxInput
              {...bind.enableBTTVEmotes}
              label={$t('Enable BetterTTV emotes for Twitch')}
            />
            <CheckboxInput
              {...bind.enableFFZEmotes}
              label={$t('Enable FrankerFaceZ emotes for Twitch')}
            />
          </div>
        )}
      </ObsSettingsSection>

      <ObsSettingsSection title={$t('Custom Navigation Bar')}>
        <CheckboxInput
          onChange={() => setCompactView()}
          label={$t(
            'Enable custom navigation bar to pin your favorite features for quick access.\nDisable to swap to compact view.',
          )}
          value={compactView}
          className={cx(styles.settingsCheckbox)}
          // style={{
          //   backgroundColor: compactView ? 'var(--checkbox)' : 'var(--teal_',
          //   borderColor: compactView ? 'var(--checkbox)' : 'var(--teal)',
          // }}
        />
        <Row gutter={[8, 8]}>
          <Col flex={1}>
            <SwitchInput
              label={$t(EMenuItem.Editor)}
              layout="horizontal"
              onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.Editor)}
              value={menuItems[EMenuItem.Editor].isActive}
              // className={}
            />
            <SwitchInput
              label={$t('Custom Editor')}
              layout="horizontal"
              onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.Highlighter)}
              value={menuItems[EMenuItem.Highlighter].isActive} // what value? Highlighter temporarily
              // className={}
            />
            <SwitchInput
              label={$t(EMenuItem.StudioMode)}
              layout="horizontal"
              onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.StudioMode)}
              value={menuItems[EMenuItem.StudioMode].isActive}
              // className={}
            />
            <SwitchInput
              label={$t(EMenuItem.LayoutEditor)}
              layout="horizontal"
              onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.LayoutEditor)}
              value={menuItems[EMenuItem.LayoutEditor].isActive}
              // className={}
            />
            <SwitchInput
              label={$t(EMenuItem.Themes)}
              layout="horizontal"
              onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.Themes)}
              value={menuItems[EMenuItem.Themes].isActive}
              // className={}
            />
          </Col>
          <Col flex={5}>
            <Scrollable style={{ height: '100%' }}>
              <SwitchInput
                label={$t(EMenuItem.AppStore)}
                layout="horizontal"
                onChange={() => toggleMenuItem(ENavName.TopNav, EMenuItem.AppStore)}
                value={menuItems[EMenuItem.AppStore].isActive}
              />
              {displayedApps.map((app, index) => (
                <Row
                  className="apps-selector"
                  style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
                >
                  <SwitchInput
                    key={`app-${index}`}
                    label={`App ${index}`}
                    layout="horizontal"
                    onChange={() => toggleApp(index)}
                    value={app && app.isActive}
                  />
                  {app ? (
                    <Select
                      defaultValue={app.name}
                      style={{ width: '300px' }}
                      onChange={value => {
                        const data = appData.find(data => data.name === value);
                        swapApp({ ...data, isActive: true }, index);
                      }}
                    >
                      <Option value={app.name ?? ''}>{app.name}</Option>
                      {appData.map(data => (
                        <Option value={data.name}>{data.name}</Option>
                      ))}
                    </Select>
                  ) : (
                    // <ListInput options={sortedApps.map(app => app.name)} disabled />
                    <Select
                      style={{ width: '500px' }}
                      defaultValue={appData[0].name}
                      onChange={value => {
                        const data = appData.find(data => data.name === value);
                        swapApp({ ...data, isActive: true }, index);
                      }}
                    >
                      {appData.map(data => (
                        <Option value={data.name}>{data.name}</Option>
                      ))}
                    </Select>
                  )}
                </Row>
              ))}
            </Scrollable>
          </Col>
        </Row>
      </ObsSettingsSection>

      <ObsSettingsSection>
        <CheckboxInput
          {...bind.enableAnnouncements}
          label={$t('Show announcements for new Streamlabs features and products')}
        />
      </ObsSettingsSection>

      <ObsSettingsSection>
        <ListInput
          {...bind.folderSelection}
          label={$t('Scene item selection mode')}
          options={[
            { value: true, label: $t('Single click selects group. Double click selects item') },
            {
              value: false,
              label: $t('Double click selects group. Single click selects item'),
            },
          ]}
        />
      </ObsSettingsSection>

      {bind.enableFFZEmotes.value && (
        <div className="section">
          <button className="button button--action" onClick={openFFZSettings}>
            {$t('Open FrankerFaceZ Settings')}
          </button>
        </div>
      )}
    </div>
  );
}

AppearanceSettings.page = 'Appearance';
