import React, { CSSProperties, useMemo } from 'react';
import { $t } from 'services/i18n';
import { useVuex } from 'components-react/hooks';
import { Services } from 'components-react/service-provider';
import { RadioInput } from './inputs';
import { displayLabels } from 'services/dual-output';
import { TDisplayType } from 'services/settings-v2';
import { EPlatform, TPlatform, platformLabels, platformList } from 'services/platforms';

interface IDisplaySelectorProps {
  id: string;
  isPlatform: boolean;
  nolabel?: boolean;
  nomargin?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function DisplaySelector(p: IDisplaySelectorProps) {
  const { DualOutputService, StreamingService } = Services;

  const v = useVuex(() => ({
    updatePlatformSetting: DualOutputService.actions.updatePlatformSetting,
    updateDestinationSetting: DualOutputService.actions.updateDestinationSetting,
    platformSettings: DualOutputService.views.platformSettings,
    destinationSettings: DualOutputService.views.destinationSettings,
    isMidstreamMode: StreamingService.views.isMidStreamMode,
  }));

  const label = p.isPlatform ? platformLabels(p.id) : p.id;
  const setting = p.isPlatform ? v.platformSettings[p.id] : v.destinationSettings[p.id];

  const displays = [
    {
      label: displayLabels('horizontal') ?? $t('Horizontal'),
      value: 'horizontal',
    },
    {
      label: displayLabels('vertical') ?? $t('Vertical'),
      value: 'vertical',
    },
  ];

  return (
    <RadioInput
      className={p?.className}
      style={p?.style}
      label={label}
      direction="horizontal"
      nolabel={p?.nolabel ?? undefined}
      nomargin={p?.nomargin ?? undefined}
      defaultValue="horizontal"
      options={displays}
      onChange={(val: TDisplayType) =>
        p.isPlatform ? v.updatePlatformSetting(p.id, val) : v.updateDestinationSetting(p.id, val)
      }
      value={setting?.display ?? 'horizontal'}
      disabled={v.isMidstreamMode}
    />
  );
}
