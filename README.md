# Sequence JSON

A format for representing sequences of timed events in JSON.

This format defines a minimal set of events that get music working, with the objective of supporting applications 
of the WebAudio and WebMIDI APIs. However, it is designed to be extensible. Consumers of Sequence JSON are expected 
to silently ignore unsupported event types so that users may also sequence their own data.


## Concepts

The Sequence format defines two data structures, a sequence and an event.

The Sequence format describes all times and durations in beats. Beat values are arbitrary, and depend on the rate of playback 
of a sequence.

## Example JSON

Here are the first two bars of Dolphin Dance represented as a sequence in JSON:

```json
{
    "name": "Dolphin Dance",
    "events": [
        [0,   "meter", 4, 1],
        [0,   "rate", 1, "step"],
        [2,   "note", 76, 0.8, 0.5],
        [2.5, "note", 77, 0.6, 0.5],
        [3,   "note", 79, 1, 0.5],
        [3.5, "note", 74, 1, 3.5],
        [10,  "note", 76, 1, 0.5],
        [0,   "chord", "C", "∆", 4],
        [4,   "chord", "G", "-", 4]
    ]
}
```


## sequence

```json
{
    "events": [...]
}
```

`events` – ARRAY<br/>
An array of events. An `events` property is the only requirement for a top-level sequence. Sequences may 
also have the properties:

```json
{
    "id": "0",
    "name": "My Sequence",
    "url":  "https://...",
    "sequences": [...]
}
```

`id` – STRING<br/>
in any array of sequences it must be unique, and is used to identify the sequence for playback.
A top level sequence does not require an `id`.

`name` – STRING, optional<br/>
An arbitrary string.

`url` – URL STRING, optional<br/>
Points to a resource where this sequence can be fetched as JSON.

`sequences`  – ARRAY, optional<br/>
An array of sequence objects.
Sequences are played back by `"sequence"` events in the `events` array.
If there are no `"sequence"` events  in the `events` array, the property `sequences` is not required.

---

## event

```js
[beat, type, ...]
```

An event is an array with a start `beat` and an event `type` as it's first two members, and a length that depends on `type`.

`beat` – FLOAT, describes a point in time from the start of the sequence<br/>
`type` – STRING, the event type, determines the structure of the rest of the data in the event array:

| beat   | type         | 2 | 3 | 4 | 5 |
| :----- | :----------- | :--- | :--- | :--- | :--- |
| `beat` | `"note"`     | `pitch` | `gain` | `duration` |  |
| `beat` | `"param"`    | `name` | `value` | `curve` | `duration` |
| `beat` | `"rate"`     | `number` |  |  |  |
| `beat` | `"meter"`    | `duration` | `divisor` |  |  |
| `beat` | `"chord"`    | `root` | `mode` | `duration` |  |
| `beat` | `"sequence"` | `id` | `target` | `duration` |  |

---

### `"note"`

```js
[beat, "note", name, gain, duration]
```

`name` – FLOAT [0-127] or STRING, represents the pitch of a note.
If `name` is a number, it is a MIDI note number, but may be a float and so can represent any frequency. MIDI note number `69` is `440Hz`.
If `name` is a string it is an arbitrary pitch name. Implementations must accept at least the 128 pitch names `'C0'` - `'G9'`, and 
the use of both the hash `#` and the unicode sharp `♯`, and both the small letter `b` and the unicode flat `♭` in their spellings.

`gain` – FLOAT [0-1], represents the force of the note's attack.
A `gain` larger than `1` is permissible, but negative `gain` is forbidden.

`duration` – FLOAT [0-n], represents the duration of the note in beats.

---

### `"param"`

```js
[beat, "param", name, value]
[beat, "param", name, value, curve]
[beat, "param", name, value, "target", duration]
```

`name` – STRING, the name of the param to control

`value` – FLOAT, the destination value of the param

`curve` – STRING `"step"`, `"linear"`, `"exponential"` or `"target"`.
The ramp to use for transition to `value`.
This parameter is optional. If it is not present the event describes a `"step"` curve.
If `curve` is `"target"` the event has a fifth parameter:

`duration` – FLOAT, the decay time of the `"target"` curve.

---

### `"rate"`

```js
[beat, "rate", rate, curve]
```

`rate`  – FLOAT, rate of playback of the parent sequence

`curve` – STRING `"step"`, `"linear"`, `"exponential"` or `"target"`, represents the type of ramp to use to transition to the new rate.

---

### `"meter"`

```js
[beat, "meter", duration, division]
```

`duration` – INT, is the duration of a bar, in beats
`division` – INT, is the duration of a division, in beats

Meter is expressed as bar duration and division duration. Here are some common time signatures as meter events:

```json
[0, "meter", 4, 1]     // 4/4
[0, "meter", 3, 1]     // 3/4
[0, "meter", 3, 0.5]   // 6/8
[0, "meter", 2, 1]     // 2/4
[0, "meter", 3.5, 0.5] // 7/8
```

A meter event MUST occur at a beat that is a full bar from a previous meter event. The second event is valid here:

```json
[0, "meter", 4, 1]
[4, "meter", 3, 1]
```

Where here it is not:

```json
[0, "meter", 4, 1]
[2, "meter", 3, 1]
```

Meter events have no effect on the rate of the beat clock. Where no `"meter"` event is defined at beat `0` consumers should 
assume a starting meter of 4/4 - ie, `[0, "meter", 4, 1]`.

---

### `"chord"`

```js
[beat, "chord", root, mode, duration]
```

`root` – INT [0-11] or STRING, represents the root of a chord.
Where `root` is a number it represents root note as a MIDI number `0-11`.
Where `root` is a string it must be a root note name, ie. `C`, `C♯`, `D` ... `A`, `B♭`, `B`.

`mode` – STRING, represents the mode of a chord.
The mode identifier may be arbitrary, but these mode names have fixed meanings:

| Symbol     | Meaning |
| :--------- | :----------------------------------- |
| `"∆♯11"`   | 4th mode of the major scale (lydian) |
| `"∆"`      | 1st mode of the major scale (ionian) |
| `"7"`      | 5th mode of the major scale (myxolydian) |
| `"-7"`     | 2nd mode of the major scale (dorian) |
| `"-♭6"`    | 6th mode of the major scale (aoelian) |
| `"7sus♭9"` | 3rd mode of the major scale (phrygian) |
| `"ø"`      | 7th mode of the major scale (locrian) |
| `"7♯11"`   | 4th mode of melodic minor |
| `"-∆"`     | 1st mode of melodic minor |
| `"∆♭6"`    | 5th mode of melodic minor |
| `"-♭9"`    | 2nd mode of melodic minor |
| `"ø7"`     | 6th mode of melodic minor |
| `"∆♯5"`    | 3rd mode of melodic minor |
| `"7alt"`   | 7th mode of melodic minor |
| `"°"`      | Diminished whole tone / half tone |
| `"7♭9"`    | Diminished half tone / whole tone |
| `"+7"`     | Whole tone |

`duration` – FLOAT, the duration of the chord in beats.

A chord event provides information about the root and mode of the music. A chord event can 
be interpreted by a music generator, or used by a notation renderer to display chord symbols.

---

### `"sequence"`

```js
[beat, "sequence", sequenceId, targetId, duration]
```

`sequenceId` – STRING, the id of a sequence found in the `sequences` array

`targetId`   – STRING, the id of an instrument to play the sequence through.

`duration`   – FLOAT,  the duration in beats to play the sequence.

Renders a sequence from the `sequences` array. For example, this event plays the sequence "my-sequence" at beat `0.5` for `3` beats:

```json
[0.5, "sequence", "my-sequence", 3]
```

<blockquote>TBD. It is not clear exactly how to spec targetId to select a target instrument in an interoperable manner. In Soundstage, it refers to the id of a node in the `nodes` array, where nodes are WebAudio nodes in the Soundstage graph.</blockquote>

---

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
