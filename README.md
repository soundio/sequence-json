# Music JSON proposal

A proposal for a format for representing music in JSON, with the aim of
making emerging web apps using the new Web Audio and Web MIDI APIs interoperable.

This document is intended as a discussion starter. Please comment, propose ideas and
make pull requests.


## Example JSON

Here are the first two bars of Dolphin Dance represented in Music JSON:

    {
        "label": "Dolphin Dance",
        "events": [
            [0,   "meter", 4, 1],
            [0,   "rate", 1, "step"],
            [2,   "note", 76, 0.8, 0.5],
            [2.5, "note", 77, 0.6, 0.5],
            [3,   "note", 79, 1, 0.5],
            [3.5, "note", 74, 1, 3.5],
            [10,  "note", 76, 1, 0.5],
            [0,   "mode", "C", "∆", 4],
            [4,   "mode", "G", "-", 4]
        ],
        "interpretation": {
            "time_signature": "4/4",
            "key": "C",
            "transpose": 0
        }
    }

## sequence

A sequence is an object with the properties `id`, `label` and `events`.

    {
        "id": "0",
        "label": "My Sequence",
        "events": [event1, event2, ...]
    }

The property `id` is a string, and in any array of sequences it must be unique. The property `label` is an arbitrary string. The property `events` is an array of event objects.

A sequence may also optionally have the properties `sequences` and `interpretation`.

    {
        "id": "0",
        "label": "My Sequence",
        "events": [event1, event2, ...],
        "sequences": [sequence1, sequence2, ...]
        "interpetation": {...},
    }

The property `sequences` is an array of sequence objects. Sequences may be nested to any arbitrary depth. The property `interpretation` is an object containing data that might help a music renderer display a score.

## event

An event is an array with a start `beat` and an event `type` as it's first two members.
An event may contain extra data dependent on `type`.

    [beat, type, data ...]

`beat` – FLOAT, describes a point in time from the start of the sequence<br/>
`type` – STRING, the event type

Beat values are arbitrary – they describe time in beats, rather than in absolute time. In a performance context, the absolute time of a beat is dependent upon the rate and the start time of its parent sequence.

The type determines the structure of the rest of the data in the event array. The possible types and their data are as follows:

#### `"note"`

Renders a note.

    [time, "note", name, velocity, duration]

`name`     – FLOAT [0-127], represents the pitch of a note as a MIDI number<br/>
`velocity` – FLOAT [0-1], represents the force of the note's attack<br/>
`duration` – FLOAT [0-n], represents the duration of the note in beats

The `name` parameter is a note pitch represented by a MIDI note number (where 0 represents note "C-1" and 127 represents note "G9"). However unlike MIDI it may be a float, allowing all pitches – tones and microtones – to be represented.

<blockquote>TBD. It may be useful to allow `name` to be a string, allowing notes in any scale, western or not, to be represented by arbitrary names.</blockquote>

#### `"param"`

Adjusts an instrument parameter.

    [beat, "param", name, value, curve]

`name` – STRING, the name of the param to control<br/>
`value` – FLOAT, the destination value of the param<br/>
`curve` – STRING ["step"|"linear"|"exponential"|"target"], represents the type of ramp to use to transition to `value`

<!--
#### `"pitch"`

    [time, "pitch", semitones]

<code>value</code> – FLOAT [semitones], represents a pitch shift in semitones
-->

#### `"rate"`

Changes the tempo the current sequence is playing at.

    [beat, "rate", rate, curve]

`rate` – FLOAT, rate of playback of the parent sequence<br/>
`curve` – STRING ["step"|"linear"|"exponential"|"target"], represents the type of ramp to use to transition to the new rate

#### `"meter"`

Changes the displayed meter of the sequence.

    [beat, "meter", numerator, denominator]

`numerator` – INT, is the number of meter divisions per bar
`denominator` – INT, is the duration in beats of a meter division

#### `"mode"`

A mode provides information about the current key centre and mode of the music. A mode event could
be used by a music renderer to display chord symbols, or could be interpreted by a music generator
to improvise music.

    [time, "mode", root, mode]

`root` – STRING ["A"|"Bb"|"B" ... "F#"|"G"|"G#"], represents the root of the chord<br/>
`mode` – STRING ["∆"|"-" ... TBD], represents the mode of the chord

#### `"sequence"`

Renders a sequence from the `sequences` array.

    [beat, "sequence", sequenceId, targetId]

`sequenceId` – STRING, the id of a sequence found in the `sequences` array<br/>
`targetId` – STRING, the id of an instrument to play the sequence through<br/>

    // Make the sequence "groove" play at beat 0.5 through instrument "3"
    [0.5, "sequence", "groove", "3"]

<!--It is proposed that a near-CSS-like syntax be used to select objects in an app:

    // Trigger object id 3
    [0.5, "sequence", "groove", "objects[id=3]"]
    
    // Trigger all plugins of type "sampler"
    [0.5, "sequence", "groove", 1, "objects[type='sampler']"]
-->

## interpretation (object)

The optional interpret object contains meta information not necessarily needed to render
music as sound, but required to render music as notation. A good renderer should
be capable of making intelligent guesses as to how to interpret Music JSON as
notation and none of these properties are required.

    {
        "meter": [4, 4],
        "key": "C",
        "transpose": 0
    }

## Implementations

- <a href="http://sound.io">sound.io</a> creates and exports Music JSON.
- <a href="http://github.com/soundio/soundstage">Soundstage</a>, the JS library that powers <a href="http://sound.io">sound.io</a>, can be used to edit and play Music JSON in any web page. 
- <a href="http://github.com/soundio/midi">MIDI</a> Soundio's MIDI library converts MIDI events to Music JSON events with it's <code>normalise</code> method.
- <a href="http://labs.cruncher.ch/scribe/">Scribe</a> is a music notation
interpreter and SVG renderer that consumes (an old version of) Music JSON.

## References

- OSC spec: <a href="http://opensoundcontrol.org/spec-1_0">http://opensseqoundcontrol.org/spec-1_0</a>
- OSC example messages: <a href="http://opensoundcontrol.org/files/OSC-Demo.pdf">http://opensoundcontrol.org/files/OSC-Demo.pdf</a>
- Music XML: <a href="http://www.musicxml.com/for-developers/">http://www.musicxml.com/for-developers/</a>
- VexFlow: <a href="http://www.vexflow.com/">http://www.vexflow.com/</a>

<!--
## Contributions

Stephen Band, Stelio Tzonis, Al Johri and Jason Sigal.
-->
