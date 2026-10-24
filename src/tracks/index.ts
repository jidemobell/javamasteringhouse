import type { Track, TrackId } from '../types';
import { nexusTrack } from './nexus';
import { miniasmTrack } from './miniasm';
import { fluxTrack } from './flux';
import { sentinelTrack } from './sentinel';
import { forgeTrack } from './forge';
import { guitarlabTrack } from './guitarlab';

export const tracks: Track[] = [nexusTrack, miniasmTrack, fluxTrack, sentinelTrack, forgeTrack, guitarlabTrack];

export const tracksById: Record<TrackId, Track> = {
  nexus: nexusTrack,
  meridian: miniasmTrack,
  flux: fluxTrack,
  sentinel: sentinelTrack,
  forge: forgeTrack,
  guitarlab: guitarlabTrack,
};
