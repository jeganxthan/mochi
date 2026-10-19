import { useCallback, useEffect, useRef } from "react";
import { MochiEngine } from "./mochiEngine";
import { PopSpring } from "./popSpring";
import { Greeting } from "./Greeting";

/**
 * The canvas is always EXPANDED_W x EXPANDED_H. Only a uniform CSS scale
 * changes between states, so the backing store is allocated once and never
 * reallocated mid-animation.
 *
 * The box is wider than the body because Mochi's hands reach past its sides
 * while waving — sizing to the body alone would clip them.
 */
const EXPANDED_W = 540;
const EXPANDED_H = 404;

/**
 * Body height at scale 1, matched to the box above.
 *
 * The engine draws the body as 1.76R tall and 2.28R wide, so the height alone
 * decides how much of the canvas is filled: at 80 the character covered only
 * 19% of the box and read as an empty frame. 320 fills ~79% of the height and
 * ~77% of the width, which leaves room for the hands that reach past the sides
 * while waving.
 */
const EXPANDED_BODY = 320;

/** Scale of the whole character in the collapsed strip. */
const RESTING_SCALE = 0.24;

/**
 * Loop period for the emote/behavior cards. Must stay below the shortest
 * expressive window in the engine — greet holds `happy` arcs for 2.0s and an
 * emote for 1.6s — so the round resting eye never flashes back in between runs.
 */
const LOOP_MS = 1500;

/** Matches the island's own transition so the two settle together. */
const SIZE_EASING = "cubic-bezier(0.16,1,0.3,1)";
const SIZE_DURATION = 500;

interface MochiCanvasProps {
    expanded?: boolean;
    emote?: "love" | "surprised" | "proud" | "wink" | "yawn" | "happy" | "annoyed";
    state?: "idle" | "working" | "thinking" | "searching" | "approval" | "question" | "error" | "finished" | "ratelimit" | "sleeping" | "dizzy" | "listening";
    behavior?: "greet" | "blink" | "squash" | "slap" | "gulp" | "roll";
    rollTurns?: number;
    /** Bump to re-run the current demo on demand. */
    replay?: number;
}


/**
 * The Mochi character, drawn on a canvas and animated in/out by the island's
 * expand state. The engine advances on its own rAF loop; React only pushes the
 * `expanded` transition in and tears the loop down on unmount.
 */
export default function MochiCanvas({
    expanded = true,
    emote,
    state,
    behavior,
    rollTurns = 1,
    replay = 0,
}: MochiCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<MochiEngine | null>(null);
    const greetedRef = useRef(false);
    const emoteTriggeredRef = useRef(false);
    const lastEmoteRef = useRef<string | undefined>(undefined);
    const lastStateRef = useRef<string | undefined>(undefined);
    const lastBehaviorRef = useRef<string | undefined>(undefined);
    const expandedRef = useRef(expanded);
    const popSpringRef = useRef<PopSpring | null>(null);
    const greetingRef = useRef<Greeting | null>(null);

    if (greetingRef.current === null) {
        greetingRef.current = new Greeting();
    }

    if (engineRef.current === null) {
        engineRef.current = new MochiEngine();
    }
    if (popSpringRef.current === null) {
        popSpringRef.current = new PopSpring();
    }

    // The pop-in spring is advanced by the render loop, so React only has to fire
    // the two transitions: kick it when the island opens, snap it shut when it
    // closes. Doing the kick inside the loop re-pinned the spring every frame and
    // it never escaped its initial value.
    useEffect(() => {
        const spring = popSpringRef.current!;
        const greeting = greetingRef.current!;

        expandedRef.current = expanded;

        if (expanded) {
            spring.kick();
            greeting.start();
            greetedRef.current = false;
            emoteTriggeredRef.current = false;
            lastEmoteRef.current = undefined;
            lastStateRef.current = undefined;
            lastBehaviorRef.current = undefined;
        } else {
            spring.snapToRest();

            greetedRef.current = false;
            emoteTriggeredRef.current = false;
            lastEmoteRef.current = undefined;
            lastStateRef.current = undefined;
            lastBehaviorRef.current = undefined;

            engineRef.current?.interruptGreet();
            greeting.interrupt();
        }
    }, [expanded]);

    // A `replay` bump re-runs whichever demo this card is showing.
    const runEmote = useCallback(() => {
        if (emote) engineRef.current?.setEmote(emote, 1.6);
    }, [emote]);

    const runBehavior = useCallback(() => {
        const eng = engineRef.current;
        if (!eng || !behavior) return;
        switch (behavior) {
            case "greet":
                eng.greet();
                break;
            case "blink":
                eng.blink();
                break;
            case "squash":
                eng.squash();
                break;
            case "slap":
                eng.slap();
                break;
            case "gulp":
                eng.gulp();
                break;
            case "roll":
                eng.doRoll(1300, rollTurns);
                break;
        }
    }, [behavior, rollTurns]);

    useEffect(() => {
        if (emote && expandedRef.current && emote !== lastEmoteRef.current) {
            lastEmoteRef.current = emote;
            lastStateRef.current = undefined;
            greetedRef.current = true;
            runEmote();
        }
    }, [emote, replay, runEmote]);

    // Emotes and one-shot behaviours are over in ~2s, so they are looped —
    // otherwise the card settles back to a neutral face and reads as "nothing
    // happened". States are persistent and need no loop.
    //
    // The period must stay UNDER the effect's expressive window, or the eyes
    // fall back to the resting round pill between runs. greet holds its `happy`
    // arcs for 2.0s and an emote for 1.6s, so a single 1.5s period keeps the
    // expressive shape up continuously with a little overlap.
    useEffect(() => {
        if (!expandedRef.current) return;
        if (!emote && !behavior) return;

        const id = window.setInterval(() => {
            if (!expandedRef.current) return;
            if (emote) runEmote();
            else runBehavior();
        }, LOOP_MS);

        return () => window.clearInterval(id);
    }, [emote, behavior, replay, runEmote, runBehavior]);

    useEffect(() => {
        if (state && expandedRef.current) {
            lastStateRef.current = state;
            lastEmoteRef.current = undefined;
            lastBehaviorRef.current = undefined;
            greetedRef.current = true;
            engineRef.current?.setState(state);
        }
    }, [state, replay]);

    useEffect(() => {
        if (behavior && expandedRef.current) {
            lastBehaviorRef.current = behavior;
            lastEmoteRef.current = undefined;
            lastStateRef.current = undefined;
            greetedRef.current = true;
            runBehavior();
        }
    }, [behavior, replay, runBehavior]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = engineRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(EXPANDED_W * dpr);
        canvas.height = Math.round(EXPANDED_H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const pointer = { x: 0, y: 0, seen: false };
        const onMove = (e: PointerEvent) => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
            pointer.seen = true;
        };
        window.addEventListener("pointermove", onMove);

        let raf = 0;
        let last = performance.now() / 1000;

        // The look-at target is the canvas centre. It only moves when the island
        // is resized or the window itself moves, so it is measured on demand
        // instead of every frame — reading it per frame forces a synchronous
        // layout on each step of the rAF loop.
        let centerX = 0;
        let centerY = 0;
        const remeasure = () => {
            const rect = canvas.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        };
        remeasure();
        window.addEventListener("resize", remeasure);

        const spring = popSpringRef.current!;
        let fade = 1;

        const step = () => {
            const now = performance.now() / 1000;
            const dt = Math.min(0.05, now - last);
            last = now;

            const isExpanded = expandedRef.current;

            const pop = spring.step(dt);

            const fadeK = 1 - Math.pow(0.0005, dt);
            fade += ((isExpanded ? 1 : 0.92) - fade) * fadeK;

            engine.bodyHeight = EXPANDED_BODY;
            engine.scale = Math.max(0.05, pop);
            engine.opacity = fade;

            // Look-at follows the pointer, once it has actually moved inside the
            // window. Before that the eyes sit centred.
            if (isExpanded && pointer.seen) {
                engine.lookX = Math.tanh((pointer.x - centerX) / 120);
                engine.lookY = -Math.tanh((pointer.y - centerY) / 90);
            }

            engine.update(dt, now);

            // Greet once the body is mostly up, not on the first frame —
            // greeting while still scaling reads as a double-take.
            if (isExpanded && !greetedRef.current && spring.readyToGreet) {
                greetedRef.current = true;
                if (emote) {
                    emoteTriggeredRef.current = true;
                    engineRef.current?.setEmote(emote, 1.6);
                } else {
                    engine.greet();
                }
            }

            ctx.clearRect(0, 0, EXPANDED_W, EXPANDED_H);
            ctx.save();
            ctx.globalAlpha = engine.opacity;
            engine.draw(ctx, EXPANDED_W, EXPANDED_H, now);
            ctx.restore();

            raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("resize", remeasure);
        };
    }, []);

const k = expanded ? 1 : RESTING_SCALE;

return (
        <div
            className="mochi-frame"
            style={{
                transform: `scale(${k})`,
                transitionDuration: `${SIZE_DURATION}ms`,
                transitionTimingFunction: SIZE_EASING,
            }}
        >
            <canvas
                ref={canvasRef}
                className="mochi-canvas"
                style={{
                    transition: `transform ${SIZE_DURATION}ms ${SIZE_EASING}`,
                }}
            />
        </div>
    );
}
