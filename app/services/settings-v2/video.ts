import { inject } from 'slap';
import { Service } from '../core/service';
import * as obs from '../../../obs-api';
import SettingsManagerService from '../settings-manager';
import { $t } from 'services/i18n';
import { metadata } from 'components-react/shared/inputs/metadata';

// export interface IVideo {
//   fpsNum: number;
//   fpsDen: number;
//   baseWidth: number;
//   baseHeight: number;
//   outputWidth: number;
//   outputHeight: number;
//   outputFormat: EVideoFormat;
//   colorspace: EColorSpace;
//   range: ERangeType;
//   scaleType: EScaleType;
//   fpsType: EFPSType;
// }

const resOptions = [{ label: '', value: '' }];

export default class VideoService extends Service {
  settingsManagerService = inject(SettingsManagerService);

  videoContext: obs.IVideo;

  init() {
    super.init();
    this.establishVideoContext();
  }

  get videoSettingsMetadata() {
    return {
      baseRes: metadata.list({ label: $t('Base (Canvas) Resolution'), options: resOptions }),
      outputRes: metadata.list({ label: $t('Output (Scaled) Resolution'), options: resOptions }),
      scaleType: metadata.list({ label: $t('Downscale Filter') }),
      fpsType: metadata.list({ label: $t('FPS Type') }),
      fpsNum: metadata.number({}),
      fpsDen: metadata.number({}),
    };
  }

  get videoSettings() {
    return this.settingsManagerService.views.videoSettings;
  }

  migrateSettings() {
    Object.keys(this.videoSettings).forEach(
      (key: keyof obs.IAdvancedStreaming | keyof obs.ISimpleStreaming) => {
        this.setVideoSetting(key, this.videoSettings[key]);
      },
    );
  }

  establishVideoContext() {
    if (this.videoContext) return;

    this.videoContext = {} as obs.IVideo;

    this.migrateSettings();
    obs.VideoFactory.videoContext = this.videoContext;
  }

  validateResolution(value: string) {
    return /0-9+x0-9+/.test(value);
  }

  setVideoSetting(key: string, value: unknown) {
    this.videoContext[key] = value;
  }

  setResolution(key: string, value: string) {
    const splitVal = value.split('x').map(val => Number(val));
    const prefix = key === 'baseRes' ? 'base' : 'output';
    this.setVideoSetting(`${prefix}Width`, splitVal[0]);
    this.setVideoSetting(`${prefix}Height`, splitVal[1]);
  }
}
