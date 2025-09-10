
import transposeEvent from '../events/transpose.js';

export default function transpose(n, events) {
    return events.map((event) => transposeEvent(n, event));
}
