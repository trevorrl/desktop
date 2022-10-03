import { Inject } from 'services/core/injector';
import { InitAfter } from 'services/core';
import { mutation, StatefulService } from '../core/stateful-service';
import * as obs from '../../../obs-api';
import { SettingsManagerService } from 'services/settings-manager';
import { $t } from 'services/i18n';
import { metadata, IListMetadata } from 'components-react/shared/inputs/metadata';

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

const fpsOptions = [
  { label: '10', value: '10-1' },
  { label: '20', value: '20-1' },
  { label: '24 NTSC', value: '24000-1001' },
  { label: '25', value: '25-1' },
  { label: '29.97', value: '30000-1001' },
  { label: '30', value: '30-1' },
  { label: '48', value: '48-1' },
  { label: '59.94', value: '60000-1001' },
  { label: '60', value: '60-1' },
];

@InitAfter('UserService')
export class VideoSettingsService extends StatefulService<{ videoContext: obs.IVideo }> {
  @Inject() settingsManagerService: SettingsManagerService;

  initialState = {
    videoContext: null as obs.IVideo,
  };

  init() {
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
            onChange: (val: string) => this.setCommonFPS(val),
            displayed: this.videoSettingsValues.fpsType === obs.EFPSType.Common,
          }),
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
    const context = this.state.videoContext;
    return {
      baseRes: `${context.baseWidth}x${context.baseHeight}`,
      outputRes: `${context.outputWidth}x${context.outputHeight}`,
      scaleType: context.scaleType,
      fpsType: context.fpsType,
      fpsNum: context.fpsNum,
      fpsDen: context.fpsDen,
    };
  }

  get videoSettings() {
    return this.settingsManagerService.videoSettings;
  }

  migrateSettings() {
    Object.keys(this.videoSettings).forEach(
      (key: keyof obs.IAdvancedStreaming | keyof obs.ISimpleStreaming) => {
        this.SET_VIDEO_SETTING(key, this.videoSettings[key]);
      },
    );
  }

  establishVideoContext() {
    if (this.state.videoContext) return;

    this.SET_VIDEO_CONTEXT();

    this.migrateSettings();
    obs.VideoFactory.videoContext = this.state.videoContext;
  }

  validateResolution(value: string) {
    return /0-9+x0-9+/.test(value);
  }

  setVideoSetting(key: string, value: unknown) {
    this.SET_VIDEO_SETTING(key, value);
  }

  setResolution(key: string, value: string) {
    const splitVal = value.split('x').map(val => Number(val));
    const prefix = key === 'baseRes' ? 'base' : 'output';
    this.SET_VIDEO_SETTING(`${prefix}Width`, splitVal[0]);
    this.SET_VIDEO_SETTING(`${prefix}Height`, splitVal[1]);
  }

  setCommonFPS(value: string) {
    const [fpsNum, fpsDen] = value.split('-');
    this.SET_VIDEO_SETTING('fpsNum', fpsNum);
    this.SET_VIDEO_SETTING('fpsDen', fpsDen);
  }

  @mutation()
  SET_VIDEO_CONTEXT() {
    this.state.videoContext = {} as obs.IVideo;
  }

  @mutation()
  SET_VIDEO_SETTING(key: string, value: unknown) {
    this.state.videoContext[key] = value;
  }
}
