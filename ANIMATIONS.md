# Mochi Animations & Color Themes

## Emotes (setEmote)

| Emote | Eye Shape | Animations | Particles | Duration/Notes |
|---|---|---|---|---|
| love | heart | Blush (0.6→0→fade), small upward head offset (oy -0.1) | 4 heart particles | ~1.6s with fade out |
| surprised | dot | Eye scale expands (es 1.25), head drops (oy -0.3), settles back | none | Startled look |
| proud | star | Head tilts left (-0.14), blush (0.7), holds then settles | 5 star particles | Holds pose briefly |
| wink | wink | Head tilts right (0.12) | none | Quick playful tilt |
| yawn | tired/closed | Eyes close ~0.7s, body stretches (sy 1.12, sx 0.94) | 2 "z" sleep particles | Yawning animation |
| happy | happy | Blush (0.6) fades out | none | Cheery expression |
| annoyed | line (slit) | Flat/slit eyes | none | ~0.8s, irritated look |

## Core Behaviors

| Behavior | Description |
|---|---|
| greet() | "Coucou" launch greeting: hands pop out, wave (0.45s to 1.55s), happy eyes ~2.0s, body squashes/springs, blinks twice, hands retract. Plays "greet" sound. interruptGreet() stops it. |
| blink() | Quick eye blink (open 1→0.06→1, 70ms+130ms) |
| squash() | Body squash/stretch (sy 0.78→1.1→1, sx 1.16→0.95→1) for impact |
| gulp() | Mailbox swallow: slot opens (0.42), chews (~0.8s), closes; body stretches/squashes with blinks |
| slap() | Poke/tap. If 3 slaps within 1.7s → triggers dizzy/too many hits. Otherwise: line eyes, squash, plays "slap" then "annoyed" |
| doRoll(durationMs, turns) | Spinning roll animation (roll prop with inOut easing), resets to 0 after |
| dizzy (state) | Triggers roll (1300ms, 2 turns), spiral eyes, special motion |

## State-Driven Animations

| State | Color | Eye | Badge | Animations/Behavior |
|---|---|---|---|---|
| idle | #E6EAEF (RGB 0.902,0.914,0.933) | pill | none | Subtle breathing/idle |
| working | #3BA2FF (0.231,0.62,1) | pill | dots (blue) | May bounce/scan |
| thinking | #8B5CFF (0.545,0.361,0.965) | pill | dots (purple) | Look target [0.55,0.55] |
| searching | #6265F2 (0.388,0.396,0.949) | pill | dots | scans=true (side-to-side) |
| approval | #F5A524 (0.961,0.647,0.141) | wide | bang (orange) | bounces, oy anim (-0.2→0) |
| question | #22D3EE (0.133,0.827,0.933) | pill | question (cyan) | blinks, tilt 0.17 |
| error | #F4505E (0.957,0.314,0.369) | flat | dot (red) | ox horizontal shake |
| finished | #34D399 (0.204,0.831,0.6) | happy | dot (green) | roll (950ms,1 turn), emits 5 sparks after 500ms |
| ratelimit | #FB9143 (0.984,0.573,0.235) | tired | dot (orange) | emits sweat periodically |
| sleeping | #94A3B8 (0.58,0.635,0.722) | closed | none | breathes, zz particles |
| dizzy | #F472B6 (0.957,0.447,0.714) | spiral | none | roll (1300ms,2 turns), spiral eyes, special motion |

## Particles
- heart, star, spark, sweat, z (sleep Z's)

## "Too Many Hits at Once" / Dizzy
- Trigger: 3 slaps within 1.7s (slapTimes)
- Engine: sets dizzy state (spiral eyes, pink #F472B6 tint, 2 full rotations roll 1300ms), calls onDizzy()
- Island: shows "confused" view for 3.3s with message "Too many hits at once." / "Give me a sec — back to work in three seconds.", then returns to previous view

## Badge Types
dots (working/thinking/searching), bang (approval), question (question), dot (error/finished/ratelimit). Badge color matches state color.

## Integration Agent Colors
Claude VS Code #F5F6F8, Resend #22C55E, n8n #F29B38, Vercel #7C5CFF, GitHub #F4505E, Notion #8C8C8C, Cal.com #C9956A, Stripe #0570DE.

## `listening` (new)

A twelfth state: Mochi listening to music.

| Field | Value |
| --- | --- |
| Colour | `#A3E635` lime |
| Tint | `0.72` |
| Eye | `closed` — content and absorbed |
| Badge | `note` (headphones, state colour) |
| Head bob | `tilt = sin(now * 2.2) * 0.13`, `yaw = sin(now * 2.2) * 0.18` |
| Particles | one `note` per 1.1s, drifting up |

Notes are a beamed pair of eighth notes: two tilted note heads, stems and a
beam, drawn in the state lime and rotated gently as they rise. The head bob is
driven by the existing `sways` flag in `update()`, alongside `scans`/`dizzy`,
and the emission cadence by its own `lastNote` field so it never collides with
the `zz`/`sweat` cadence on `lastAmbient`.
