import { inject } from 'slap';
import { Service } from '../core/service';
import * as obs from '../../../obs-api';
import SettingsManagerService from '../settings-manager';
import { $t } from 'services/i18n';
import { metadata, IListMetadata } from 'components-react/shared/inputs/metadata';
import { InitAfter } from 'services/core';

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

interface ICommonFPS {
  fpsNum: number;
  fpsDen: number;
}

const resOptions = [{ label: '', value: '' }];

const fpsOptions = [
  { label: '10', value: { fpsNum: 10, fpsDen: 1 } },
  { label: '20', value: { fpsNum: 20, fpsDen: 1 } },
  { label: '24 NTSC', value: { fpsNum: 24000, fpsDen: 1001 } },
  { label: '25', value: { fpsNum: 25, fpsDen: 1 } },
  { label: '29.97', value: { fpsNum: 30000, fpsDen: 1001 } },
  { label: '30', value: { fpsNum: 30, fpsDen: 1 } },
  { label: '48', value: { fpsNum: 48, fpsDen: 1 } },
  { label: '59.94', value: { fpsNum: 60000, fpsDen: 1001 } },
  { label: '60', value: { fpsNum: 60, fpsDen: 1 } },
];

@InitAfter('UserService')
export default class VideoService extends Service {
  settingsManagerService = inject(SettingsManagerService);

  videoContext: obs.IVideo;

  init() {
    super.init();
    this.establishVideoContext();
  }

  get videoSettingsMetadata() {
    return {
      baseRes: metadata.list({
        label: $t('Base (Canvas) Resolution'),
        options: resOptions,
        validator: this.validateResolution,
        onChange: (val: string) => this.setResolution('baseRes', val),
      }),
      outputRes: metadata.list({
        label: $t('Output (Scaled) Resolution'),
        options: resOptions,
        validator: this.validateResolution,
        onChange: (val: string) => this.setResolution('outputRes', val),
      }),
      scaleType: metadata.list({
        label: $t('Downscale Filter'),
        options: [
          {
            label: $t('Bilinear (Fastest, but blurry if scaling)'),
            value: obs.EScaleType.Bilinear,
          },
          { label: $t('Bicubic (Sharpened scaling, 16 samples)'), value: obs.EScaleType.Bicubic },
          { label: $t('Lanczos (Sharpened scaling, 32 samples)'), value: obs.EScaleType.Lanczos },
        ],
      }),
      fpsType: metadata.list({
        label: $t('FPS Type'),
        options: [
          { label: $t('Common FPS Values'), value: obs.EFPSType.Common },
          { label: $t('Integer FPS Values'), value: obs.EFPSType.Integer },
          { label: $t('Fractional FPS Values'), value: obs.EFPSType.Fractional },
        ],

        children: {
          fpsCom: metadata.list({
            label: $t('Common FPS Values'),
            options: fpsOptions,
            onChange: (val: ICommonFPS) => this.setCommonFPS(val),
          }) as IListMetadata<ICommonFPS>,
          fpsNum: metadata.number({
            label: $t('FPS Number'),
            displayed: [obs.EFPSType.Integer, obs.EFPSType.Fractional].includes(
              this.videoSettingsValues.fpsType,
            ),
          }),
          fpsDen: metadata.number({
            label: $t('FPS Density'),
            displayed: this.videoSettingsValues.fpsType === obs.EFPSType.Fractional,
          }),
        },
      }),
    };
  }

  get videoSettingsValues() {
    return {
      baseRes: `${this.videoSettings.baseWidth}x${this.videoSettings.baseHeight}`,
      outputRes: `${this.videoSettings.outputWidth}x${this.videoSettings.outputHeight}`,
      scaleType: this.videoSettings.scaleType,
      fpsType: this.videoSettings.fpsType,
      fpsNum: this.videoSettings.fpsNum,
      fpsDen: this.videoSettings.fpsDen,
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

  setCommonFPS(value: ICommonFPS) {
    this.videoContext.fpsNum = value.fpsNum;
    this.videoContext.fpsDen = value.fpsDen;
  }
}
