import React from 'react';
import { inject, useModule } from 'slap';
import { VideoSettingsService } from 'app-services';
import FormFactory from 'components-react/shared/inputs/FormFactory';

class VideoSettingsModule {
  service = inject(VideoSettingsService);

  get values() {
    return this.service.videoSettingsValues;
  }

  get metadata() {
    return this.service.videoSettingsMetadata;
  }

  onChange(key: string) {
    return (val: unknown) => this.service.setVideoSetting(key, val);
  }
}

export function VideoSettings() {
  const { values, metadata, onChange } = useModule(VideoSettingsModule);

  return <FormFactory values={values} metadata={metadata} onInput={onChange} />;
}

VideoSettings.page = 'Video';
