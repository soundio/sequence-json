
import transposeEvent from '../events/transpose.js';

export default function transpose(transpose, events) {
    return events.map((event) => transposeEvent(transpose, event));
}
