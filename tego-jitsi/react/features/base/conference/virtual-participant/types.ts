import { IJitsiConference } from '../reducer';

export interface IVirtualParticipant {
    conference: IJitsiConference;
    displayName: string;
    id: string;
    role: string;
    sources: Map<string, Map<string, IVideoSource>>;
}

export interface IVideoSource {
    muted: boolean;
    videoType: string;
}
