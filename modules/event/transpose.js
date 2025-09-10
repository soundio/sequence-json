
import id       from 'fn/id.js';
import overload from 'fn/overload.js';
import { toRootNumber } from 'midi/note.js';

export default overload((transpose, event) => event[1], {
    note: (tranpose, event) => {
        // TODO: do not transpose GM drum string names
        event[2] = toNoteNumber(event[2]) + transpose;
        return event;
    },

    chord: (transpose, event) => {
        event[2] = toRootNumber(toRootNumber(event[2]) + transpose);
        if (event[5]) event[5] = toRootNumber(toRootNumber(event[2]) + transpose);
        return event;
    },

    key: (transpose, event) => {
        // TODO: this is supposed to indicate spelling
        event[2] = toRootNumber(toRootNumber(event[2]) + transpose);
        return event;
    },

    default: id
});
