import { IToolboxButton } from '../types';

import CaptureButton from './CaptureButton';

const screenShot: IToolboxButton = {
    key: 'screenShot',
    Content: CaptureButton,
    group: 10
};

/**
 * A hook that returns the capture button.
 *
 *  @returns {Object}
 */
export function useCaptureButton() {
    return screenShot;
}
