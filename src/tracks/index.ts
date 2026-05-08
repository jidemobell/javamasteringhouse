import type { Track, TrackId } from '../types';
import { nexusTrack } from './nexus';
import { miniasmTrack } from './miniasm';
import { fluxTrack } from './flux';
import { sentinelTrack } from './sentinel';

export const tracks: Track[] = [nexusTrack, miniasmTrack, fluxTrack, sentinelTrack];

export const tracksById: Record<TrackId, Track> = {
  nexus: nexusTrack,
  meridian: miniasmTrack,
  flux: fluxTrack,
  sentinel: sentinelTrack,
};
