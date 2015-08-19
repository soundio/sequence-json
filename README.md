# Music JSON proposal

A proposal for a standard format for representing music in JSON, with the aim of
making emerging web apps using the new Web Audio and Web MIDI APIs interoperable.

This document is intended as a discussion starter. Please comment, propose ideas and
make pull requests.


## Example JSON

Here are the first two bars of Dolphin Dance represented in Music JSON:

    {
        "sequence": [
            [2,   "note", 76, 0.8, 0.5],
            [2.5, "note", 77, 0.6, 0.5],
            [3,   "note", 79, 1, 0.5],
            [3.5, "note", 74, 1, 3.5],
            [10,  "note", 76, 1, 0.5],
            [0, "chord", "C", "∆", 4],
            [4, "chord", "G", "-", 4]
        ],
        
        "interpretation": {
            "time_signature": "4/4",
            "key": "C",
            "transpose": 0
        }
    }

## sequence

A sequence is an array of events.

    [event1, event2, ... ]

## event

An event is an array describing the time and type and the data needed to
describe the event.

    [time, type, data ...]

An event MUST have a start <code>time</code> and a <code>type</code>.
An event also contains extra data that is dependent on the type.

    [time, type, data ..., address]

Events MAY have an optional final string, <code>address</code>, that can be
used by apps to address plugins. It is proposed that a CSS-like syntax be
used to select objects in an app:

    // Trigger object id 3
    [time, type, data ..., 'objects[id=3]']
    
    // Trigger all plgins of type "sampler"
    [time, type, data ..., 'objects[type="sampler"]']



### time

<code>time</code> is a float describing a point in time from the time the
sequence is started.

<code>time</code> values are arbitrary – they describe time in beats, rather than
in absolute time, like seconds. The actual time an event is played is dependent
upon the rate at which a sequence is played.

### type

A string describing the type of event. The type determines the structure of the
rest of the data in the event array:

    [time, "note", number, velocity, duration]
    [time, "param", name, value, curve]
    [time, "control", number, value]
    [time, "pitch", semitones]
    [time, "chord", keycentre, mode, duration]
    [time, "sequence", id]

An event array may hold additional data beyond that defined above. Such data is
considered application-specific. For example, an application may want to have
a note or control played by a specific plugin, so it may add an address string
to the event data:

    [time, "note", number, velocity, duration, "objects[id:3]note"]
    [time, "control", number, value, "objects[id:8]gain"]

Implementations may ignore or overwrite application-specific data.

#### "note"

    [time, "note", number, velocity, duration]

<code>number</code> – INT [0-127], represents the pitch of a note<br/>
<code>velocity</code> – FLOAT [0-1], represents the force of the note's attack<br/>
<code>duration</code> – FLOAT [0-n], represents the duration at the sequence's current rate

#### "param"

    [time, "param", name, value, curve]

<code>name</code> – STRING, the name of the param to control<br/>
<code>value</code> – FLOAT [0-1], the new value of the control<br/>
<code>curve</code> – STRING ["step"|"linear"|"exponential"], represents the type of ramp to use to transition to <code>value</code>

#### "control"

Useful for MIDI apps, but it is preferred to use "param" events.

    [time, "control", number, value, curve]

<code>number</code> – INT [0-127], represents the number of the control<br/>
<code>value</code> – FLOAT [0-1], represents the value of the control<br/>

#### "pitch"

    [time, "pitch", semitones]

<code>value</code> – FLOAT [-2 - 2], represents the pitch shift in semitones

#### "chord"

A chord gives information about the current key centre and mode of the music. A chord event could
be used by a music renderer to display chord symbols, or could be interpreted by a music generator
to improvise music.

    [time, "chord", root, mode]

<code>root</code> – STRING ["A","Bb","B", ... "F#","G","G#"], represents the root of the chord<br/>
<code>mode</code> – STRING ["∆","-", ... TBD], represents the mode of the chord

#### "sequence"

    [time, "sequence", sequence, rate]

<code>sequence</code> ARRAY, an array of events, or STRING, an id of a sequence(TBD)<br/>
<code>rate</code> FLOAT [0-n], the rate at which to play back the sequence relative to the rate of the
current sequence.

## interpretation (object)

The optional interpret object contains meta information not directly needed to render the
music as sound, but required to render music as notation. A good renderer should
be capable of making intelligent guesses as to how to interpret Music JSON as
notation and none of these properties are required.

    {
        "time_signature": "4/4",
        "key": "C",
        "transpose": 0
    }

## Implementations

- <a href="http://github.com/soundio/midi">MIDI</a> Soundio's MIDI library converts MIDI events to Music JSON events with it's <code>normalise</code> method.
- <a href="http://github.com/soundio/sequence">Sequence</a> Soundio's Sequence object consumes and creates Music JSON. There's a demo at <a href="http://sound.io/sequencer/">sound.io/sequencer</a>.
- <a href="http://labs.cruncher.ch/scribe/">Scribe</a> is a music notation
interpreter and SVG renderer that consume (an old version of) Music JSON.

## References

- OSC spec: <a href="http://opensoundcontrol.org/spec-1_0">http://opensoundcontrol.org/spec-1_0</a>
- OSC example messages: <a href="http://opensoundcontrol.org/files/OSC-Demo.pdf">http://opensoundcontrol.org/files/OSC-Demo.pdf</a>
- Music XML: <a href="http://www.musicxml.com/for-developers/">http://www.musicxml.com/for-developers/</a>
- VexFlow: <a href="http://www.vexflow.com/">http://www.vexflow.com/</a>

## Contributions

Only a few very brief discussions have been had, which have served to identify a
basic need. People involved: Stephen Band, Stelio Tzonis, Al Johri and Jason Sigal.
