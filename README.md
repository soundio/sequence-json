# Music JSON proposal

A proposal for a standard way of creating music sequence data in JSON

## Background

This document aims to describe a way to describe musical information in JSON.
The JSON should be minimal, easy to extract information from, easily readable by
software, and easy to convert to other formats such as MIDI or OSC. It is bourne
out of a need to standardise a way of exchanging music between emerging apps and
web apps, and was discussed at Mozilla Festival London 2014.

This spec is intended as a discussion starter. Please comment, propose ideas and
make pull requests.

## Example JSON

Here are the first two bars of Dolphin Dance, represented in Music JSON:

    {
        "sequence": [
            [2,   0.5, "note", 76, 0.8],
            [2.5, 0.5, "note", 77, 0.6],
            [3,   0.5, "note", 79, 1],
            [3.5, 3.5, "note", 74, 1],
            [10,  0.5, "note", 76, 1],
            [0, 4, "chord", "C∆"],
            [4, 4, "chord", "G-"]
        ],

        "interpretation": {
            "time_signature": "4/4",
            "key": "C",
            "transpose": 0
        },

        "rate": 1,
    }

## Sequence (array)

A sequence is an array of events.

    [event1, event2, ... ]

## Event (array)

An event is an array describing the timing, duration and type and any extra data
associated with an event.

    [time, duration, type, data ...]

An event MUST have a start <code>time</code>, a <code>duration</code> and a
<code>type</code>. An event also contains extra
data that is dependent on the type.

#### time (float)

<code>time</code> is a float describing a point in time from the time the
sequence is started.

<code>time</code> values are arbitrary. The actual time an event is played is
dependent upon the <code>time</code> value of the event AND the rate at which
the sequence is played. <code>time</code> values do not directly describe
seconds or beats – although they could if the sequence were played back at the
correct rate.

#### duration (float)

<code>duration</code> is a float describing the length of time the event is to
be played for. As with <code>time</code>, the resulting duration of an event
depends on the speed the sequence is played at.

#### type (string)

A string describing the type of the event. Possible values are:

- <code>"note"</code> A musical note. 
- <code>"chord"</code> A musical symbol describing the current key centre and mode.
- <code>"sequence"</code> A sequence event carries the data for a sequence array, enabling the playback of nested sequences.
- <code>"control"</code> A controller event. <code>duration</code> is <code>0</code>.
- <code>"pitch"</code> Pitch bend. <code>duration</code> is <code>0</code>.
- <code>"noteon"</code> and <code>"noteoff"</code>, for carrying MIDI-like note information. <code>duration</code> is <code>0</code>.

#### data

A <code>"note"</code> event must have the data values <code>note number</code> and <code>note velocity</code>:

    [time, duration, "note", number, velocity]

A <code>"control"</code> event must have the data values <code>number</code> in the range 0-127, and <code>value</code> as a float in the range 0-1. Values outside this range are acceptable, but may be
lost if converted to MIDI.

    [time, duration, "control", number, value]

It can also carry an optional string describing an automation curve. A curve should cause
<code>value</code> to ramp to the new value at <code>time</code>.

    [time, duration, "control", number, value, "exponential"]

A <code>"pitch"</code> event must have the data value <code>semitones</code>, a float in the range -2 to 2.

    [time, duration, "pitch", semitones]

It can also carry an optional string describing an automation curve. A curve should cause
<code>semitones</code> to ramp to the new value at <code>time</code>.

    [time, duration, "pitch", semitones, "exponential"]

A <code>"chord"</code> event must have a string that represents the current key centre and mode:

    [time, duration, "chord", symbol]

A chord event can be used by a music renderer to display chord symbols, or can
be interpreted by a music generator.

A <code>"sequence"</code> event must have an array that contains the data of a 'child' sequence:

    [time, duration, "sequence", array]

Possible curves are:

    "step"
    "linear"
    "exponential"

## Interpretation (object)

The interpret object contains meta information not directly needed to render the
music as sound, but required to render music visually.

    {
        "time_signature": "4/4",
        "key": "C",
        "transpose": 0
    }

## Implementations

- <a href="http://github.com/sound-io/midi">MIDI</a> sound.io's MIDI library converts MIDI events to Music JSON events with it's <code>normalise</code> method.
- <a href="http://labs.cruncher.ch/scribe/">Scribe</a> is a music notation
interpreter and SVG renderer that tries to consume Music JSON.

## References

- OSC spec: <a href="http://opensoundcontrol.org/spec-1_0">http://opensoundcontrol.org/spec-1_0</a>
- OSC example messages: <a href="http://opensoundcontrol.org/files/OSC-Demo.pdf">http://opensoundcontrol.org/files/OSC-Demo.pdf</a>
- Music XML: <a href="http://www.musicxml.com/for-developers/">http://www.musicxml.com/for-developers/</a>
- VexFlow: <a href="http://www.vexflow.com/">http://www.vexflow.com/</a>

## Contributions

Only a few very brief discussions have been had, which have served to identify a
basic need. People involved: Stephen Band, Stelio Tzonis, Al Johri and Jason Sigal.
