import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { IHotkey } from 'services/hotkeys';
import Hotkey from './Hotkey';

class HotKeyGroupProps {
  hotkeys: IHotkey[] = [];
  title: string | null = null;
  isSearch: boolean = false;
}

function Header({
  title,
  isCollapsible,
  collapsed,
}: {
  title: string | null;
  isCollapsible: boolean;
  collapsed: boolean;
}) {
  if (title) {
    return (
      <h2 className="section-title section-title--dropdown">
        {isCollapsible && collapsed ? <i className="fa fa-plus section-title__icon" /> : null}
        {isCollapsible && !collapsed ? <i className="fa fa-minus section-title__icon" /> : null}
        {title}
      </h2>
    );
  }

  return null;
}

export default function HotKeyGroup(props: React.PropsWithChildren<HotKeyGroupProps>) {
  const [collapsed, setCollapsed] = useState(true);

  const [isCollapsible, setIsCollapsible] = useState<boolean>(
    (props.title && !props.isSearch) as boolean,
  );

  return (
    <div className="section">
      <Header title={props.title} isCollapsible={isCollapsible} collapsed={collapsed} />
      <div className="expand">
        {(!isCollapsible || collapsed) && (
          <div className={cx({ 'section-content--opened': !!props.title }, 'section-content')}>
            {props.hotkeys.map(hotkey => (
              <div key={hotkey.actionName + hotkey.sceneId + hotkey.sceneItemId + hotkey.sourceId}>
                <Hotkey hotkey={hotkey} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

}
