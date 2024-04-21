# Music JSON

A format for representing music in JSON.


## Example JSON

Here are the first two bars of Dolphin Dance represented in Music JSON:

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

A sequence is an object with the properties `id`, `name` and `events`.

```json
{
    "id": "0",
    "name": "My Sequence",
    "events": [event1, event2, ...]
}
```

The property `id` is a string, and in any array of sequences it must be unique. The property `name` is an arbitrary string. The property `events` is an array of event objects.

A sequence may also optionally have the property `sequences`.

```json
{
    "id": "0",
    "name": "My Sequence",
    "events": [event1, event2, ...],
    "sequences": [sequence1, sequence2, ...]
}
```

The property `sequences` is an array of sequence objects. Sequences may be nested to any arbitrary depth.

## event

An event is an array with a start `beat` and an event `type` as it's first two members, and extra data depending on `type`.

```js
[beat, type, data...]
```

`beat` – FLOAT, describes a point in time from the start of the sequence<br/>
`type` – STRING, the event type

Beat values are arbitrary – they describe time in beats, rather than in absolute time. `type` determines the structure of the rest of the data in the event array.
The possible types are:

| beat   | type         | 2 | 3 | 4 | 5 |
| :----- | :----------- | :--- | :--- | :--- | :--- |
| `beat` | `"note"`     |  |  |  |  |
| `beat` | `"param"`    | |  |  |  |
| `beat` | `"rate"`     | |  |  |  |
| `beat` | `"meter"`    | |  |  |  |
| `beat` | `"chord"`    | |  |  |  |
| `beat` | `"sequence"` | |  |  |  |


| beat   | type         | 2      | 3      | 4      | 5      |
| :----- | :----------- | :----- | :----- | ;----- | :----- |
| `beat` | `"note"`     | `pitch` | `gain` | `duration` | – |
| `beat` | `"param"`    | `name` | `value` | `curve` | `duration` |
| `beat` | `"rate"`     | `number` | – | – | – |
| `beat` | `"meter"`    | `duration` | `divisor` | – | – |
| `beat` | `"chord"`    | `root` | `mode` | – | – |
| `beat` | `"sequence"` | `slug` | `target` | `duration` | – |

### `"note"`

Renders a note.

```js
[beat, "note", name, gain, duration]
```

`name`     – FLOAT [0-127] || STRING, represents the pitch of a note<br/>
`gain`     – FLOAT [0-1], represents the force of the note's attack<br/>
`duration` – FLOAT [0-n], represents the duration of the note in beats

If `name` is a number, it is a MIDI note number, but may be a float and so can represent any frequency. MIDI note number `69` is `440Hz`.
If `name` is a string it is an arbitrary pitch name. Implementations must accept at least the 128 pitch names `'C0'` - `'G9'`, and 
the use of both the hash `#` and the unicode sharp `♯`, and both the small letter `b` and the unicode flat `♭` in their spellings.


### `"param"`

Adjusts an instrument parameter.

```js
[beat, "param", name, value, curve]
```

If `curve` is `"target"`, the event has a sixth parameter:

```js
[beat, "param", name, value, "target", duration]
```

`name`     – STRING, the name of the param to control<br/>
`value`    – FLOAT, the destination value of the param<br/>
`curve`    – STRING ["step"|"linear"|"exponential"|"target"], ramp to use for transition to `value`
`duration` – FLOAT, the decay time of the target curve


### `"rate"`

Changes the tempo the current sequence is playing at.

```js
[beat, "rate", rate, curve]
```

`rate`  – FLOAT, rate of playback of the parent sequence<br/>
`curve` – STRING ["step"|"linear"|"exponential"|"target"], represents the type of ramp to use to transition to the new rate


### `"meter"`

Changes the meter of the sequence.

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

Meter events have no effect on the rate of the beat clock.


### `"chord"`

A chord event provides information about the root and mode of the music. A chord event can 
be interpreted by a music generator, or used by a notation renderer to display chord symbols.

```js
[beat, "chord", name]
```

`name` – STRING, represents the root and mode of a chord

The first one or two characters of a chord name is the root, `C`, `C♯`, `D` ... `A`, `B♭`, `B`. Following
characters describe a mode. The mode identifier may be arbitrary, but these mode names have fixed meanings:

| Symbol    | Meaning |
| :-------- | :----------------------------------- |
| `∆♯11`    | 4th mode of the major scale (lydian) |
| `∆`       | 1st mode of the major scale (ionian) |
| `7`       | 5th mode of the major scale (myxolydian) |
| `-7`      | 2nd mode of the major scale (dorian) |
| `-♭6`     | 6th mode of the major scale (aoelian) |
| `7sus♭9`  | 3rd mode of the major scale (phrygian) |
| `ø`       | 7th mode of the major scale (locrian) |
| `7♯11`    | 4th mode of melodic minor |
| `-∆`      | 1st mode of melodic minor |
| `∆♭6`     | 5th mode of melodic minor |
| `-♭9`     | 2nd mode of melodic minor |
| `ø7`      | 6th mode of melodic minor |
| `∆♯5`     | 3rd mode of melodic minor |
| `7alt`    | 7th mode of melodic minor |
| `°`       | Diminished whole tone / half tone |
| `7♭9`     | Diminished half tone / whole tone |
| `+7`      | Whole tone |


### `"sequence"`

Renders a sequence from the `sequences` array.

```js
[beat, "sequence", sequenceId, targetId, duration]
```

`sequenceId` – STRING, the id of a sequence found in the `sequences` array<br/>
`targetId`   – STRING, the id of an instrument to play the sequence through<br/>
`duration`   – FLOAT,  the duration in beats to play the sequence<br/>

    // Make the sequence "groove" play at beat 0.5 through instrument "3"
    [0.5, "sequence", "groove", "3"]

<blockquote>TBD. It is not clear exactly how to spec targetId to select a target instrument in an interoperable manner. In Soundstage, it refers to the id of a node in the `nodes` array, where nodes are WebAudio nodes in the Soundstage graph.</blockquote>


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
