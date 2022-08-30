import { Service } from './core/service';
import * as obs from '../../obs-api';

export class OutputsService extends Service {
  stream: obs.ISimpleStreaming | obs.IAdvancedStreaming;
  advancedMode: boolean;

  init() {
    super.init();

    this.advancedMode = obs.SimpleStreamingFactory.legacySettings.useAdvanced;

    if (this.advancedMode) {
      this.stream = obs.AdvancedStreamingFactory.create();
    } else {
      this.stream = obs.SimpleStreamingFactory.create();
    }
  }

  setAdvanced(value: boolean) {
    if (this.advancedMode === value) return;
    if (value) {
      obs.SimpleStreamingFactory.destroy(this.stream as obs.ISimpleStreaming);
      this.stream = obs.AdvancedStreamingFactory.create();
    } else {
      obs.AdvancedStreamingFactory.destroy(this.stream as obs.IAdvancedStreaming);
      this.stream = obs.SimpleStreamingFactory.create();
    }
    this.advancedMode = value;
  }

  setStreamSetting(key: keyof obs.IAdvancedStreaming | keyof obs.ISimpleStreaming, value: unknown) {
    this.stream[key] = value;
  }
}
