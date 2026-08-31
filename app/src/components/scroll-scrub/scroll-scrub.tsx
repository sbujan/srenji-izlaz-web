/* Scroll scrub React/TanStack reference implementation. */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import "./scroll-scrub.css";

export interface ScrollScrubScene {
  id: string;
  label: string;
  /** Exact first frame of the deployed desktop clip. */
  poster: string;
  /** Exact first frame of mobileClip; provide whenever mobileClip is set. */
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  title: string;
  body: string;
  kicker?: string;
  tags?: string[];
  actions?: ReactNode;
  align?: "left" | "right";
  /** Viewport-heights assigned to this scene. More distance means slower scrub. */
  scroll?: number;
  /** 0..0.6. Slow the middle of the clip without changing either seam frame. */
  linger?: number;
  objectPosition?: string;
  mobileObjectPosition?: string;
}

export interface ScrollScrubConnector {
  /** Exact first frame of this connector clip; never substitute a scene still. */
  poster: string;
  /** Exact first frame of mobileClip; provide whenever mobileClip is set. */
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  scroll?: number;
}

export interface ScrollScrubTheme {
  background: string;
  ink: string;
  muted: string;
  accent: string;
}

/**
 * One continuous film for phones, replacing the per-chapter clips there.
 *
 * The chapter clips are cuts of a single unbroken shot, and playing each from
 * its own zero means the world jumps forward at every seam unless the visitor
 * waits out the full clip. A single element playing one file makes continuity
 * structural: arriving at chapter i extends the playback target to
 * `chapterEnds[i]` and the film simply keeps going — it can never jump, and
 * only one video is ever decoded and composited. `chapterEnds` are the
 * source-time boundaries between chapters, in seconds, ending at the film's
 * duration. Pass a module-level constant: the controller effect re-initialises
 * when this prop's identity changes.
 */
export interface ScrollScrubMobileFilm {
  src: string;
  chapterEnds: number[];
}

export interface ScrollScrubProps {
  scenes: ScrollScrubScene[];
  /** Leave empty for continuous-forward architecture A. */
  connectors?: (ScrollScrubConnector | null)[];
  theme: ScrollScrubTheme;
  className?: string;
  mobileFilm?: ScrollScrubMobileFilm;
  onActiveSectionChange?: (index: number) => void;
}

interface Segment {
  key: string;
  kind: "scene" | "connector";
  sectionIndex: number;
  nextSectionIndex: number;
  poster: string;
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
  weight: number;
  linger: number;
  objectPosition: string;
  mobileObjectPosition: string;
  scene?: ScrollScrubScene;
}

interface RuntimeSegment extends Segment {
  band: HTMLElement;
  layer: HTMLElement;
  start: number;
  end: number;
  current: number;
  target: number;
  visible: boolean;
  loading: boolean;
  ready: boolean;
  failed: boolean;
  loadedSource?: string;
  /** Play mode only: this chapter's clip has been started for this arrival. */
  played?: boolean;
  video?: HTMLVideoElement;
  objectUrl?: string;
  abort?: AbortController;
}

interface Controller {
  jumpToSection: (index: number) => void;
}

type ThemeStyle = CSSProperties & Record<`--ss-${string}`, string | number>;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

const lingerEase = (value: number, amount: number) => {
  const x = clamp(value);
  const linger = clamp(amount, 0, 0.6);
  const centered = x - 0.5;
  return (1 - linger) * x + linger * (4 * centered ** 3 + 0.5);
};

function buildSegments(
  scenes: ScrollScrubScene[],
  connectors: (ScrollScrubConnector | null)[]
): Segment[] {
  const result: Segment[] = [];

  for (const [index, scene] of scenes.entries()) {
    if (scene.mobileClip && !scene.mobilePoster) {
      throw new Error(`Scene ${scene.id} needs mobilePoster for mobileClip`);
    }
    result.push({
      clip: scene.clip,
      key: `scene:${scene.id}`,
      kind: "scene",
      linger: scene.linger ?? 0,
      mobileClip: scene.mobileClip,
      mobilePoster: scene.mobilePoster,
      mobileObjectPosition:
        scene.mobileObjectPosition ?? scene.objectPosition ?? "50% 50%",
      nextSectionIndex: index,
      objectPosition: scene.objectPosition ?? "50% 50%",
      poster: scene.poster,
      scene,
      sectionIndex: index,
      weight: scene.scroll ?? 1.4,
    });

    const connector = connectors[index];
    if (index < scenes.length - 1 && connector?.clip) {
      if (connector.mobileClip && !connector.mobilePoster) {
        throw new Error(
          `Connector after ${scene.id} needs mobilePoster for mobileClip`
        );
      }
      const nextScene = scenes[index + 1];
      result.push({
        clip: connector.clip,
        key: `connector:${scene.id}:${nextScene.id}`,
        kind: "connector",
        linger: 0,
        mobileClip: connector.mobileClip,
        mobilePoster: connector.mobilePoster,
        mobileObjectPosition:
          nextScene.mobileObjectPosition ??
          nextScene.objectPosition ??
          "50% 50%",
        nextSectionIndex: index + 1,
        objectPosition: nextScene.objectPosition ?? "50% 50%",
        poster: connector.poster,
        sectionIndex: index,
        weight: connector.scroll ?? 0.8,
      });
    }
  }

  return result;
}

export function ScrollScrub({
  scenes,
  connectors,
  theme,
  className,
  mobileFilm,
  onActiveSectionChange,
}: ScrollScrubProps) {
  const rootRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const onActiveRef = useRef(onActiveSectionChange);
  const [activeSection, setActiveSection] = useState(0);
  const segments = useMemo(
    () => buildSegments(scenes, connectors ?? []),
    [connectors, scenes]
  );

  // Keep the latest callback reachable from the scroll loop without making it a
  // dependency of the controller effect. Synced in an effect, never during
  // render — a render-phase ref write breaks under React Compiler.
  useEffect(() => {
    onActiveRef.current = onActiveSectionChange;
  }, [onActiveSectionChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || segments.length === 0) {
      return;
    }

    const layerNodes = [
      ...root.querySelectorAll<HTMLElement>("[data-scroll-scrub-layer]"),
    ];
    const bandNodes = [
      ...root.querySelectorAll<HTMLElement>("[data-scroll-scrub-band]"),
    ];
    if (
      layerNodes.length !== segments.length ||
      bandNodes.length !== segments.length
    ) {
      throw new Error("ScrollScrub segment markup is out of sync");
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarsePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)"
    ).matches;
    const smallViewport = window.matchMedia("(max-width: 860px)");
    const isMobile = () => coarsePointer || smallViewport.matches;
    /**
     * On a phone each chapter is one screenful that the visitor snaps to, and
     * the clip simply plays when it lands — dragging a video frame-by-frame
     * with a finger is expensive to decode and fights inertial scrolling.
     * Desktop keeps the scrub. See the mobile block in scroll-scrub.css.
     */
    const playMode = () => isMobile() && !reduceMotion;
    /**
     * Film mode: one continuous clip in the first layer carries the whole
     * journey (see ScrollScrubMobileFilm). `filmFailed` drops just the visual
     * part — the other layers come back and show their per-chapter posters, the
     * same degraded state reduced-motion visitors get — while loading stays in
     * film mode so nothing tries to fetch the departed per-chapter clips.
     */
    let filmFailed = false;
    const filmMode = () => playMode() && Boolean(mobileFilm);
    const filmVisual = () => filmMode() && !filmFailed;
    const syncFilmAttr = () => {
      if (filmVisual()) {
        root.dataset.filmMode = "true";
      } else {
        delete root.dataset.filmMode;
      }
    };
    const sourceFor = (segment: RuntimeSegment) => {
      if (filmMode()) {
        return segment === runtime[0] ? (mobileFilm?.src ?? "") : "";
      }
      return isMobile() && segment.mobileClip ? segment.mobileClip : segment.clip;
    };
    const runtime: RuntimeSegment[] = segments.map((segment, index) => ({
      ...segment,
      band: bandNodes[index],
      current: 0,
      end: 0,
      failed: false,
      layer: layerNodes[index],
      loading: false,
      ready: false,
      start: 0,
      target: 0,
      visible: index === 0,
    }));

    let active = -1;
    let activeSegment = -1;
    /** Film mode: source-time the film may play up to before pausing. */
    let filmTarget = 0;
    let destroyed = false;
    let dirty = true;
    let frame = 0;
    let rootTop = 0;
    let total = 1;
    let viewportHeight = window.innerHeight;
    let layoutWidth = window.innerWidth;
    let userReady = false;

    const unloadClip = (segment: RuntimeSegment) => {
      segment.abort?.abort();
      segment.video?.remove();
      if (segment.objectUrl) {
        URL.revokeObjectURL(segment.objectUrl);
      }
      delete segment.abort;
      delete segment.video;
      delete segment.objectUrl;
      delete segment.loadedSource;
      segment.loading = false;
      segment.ready = false;
      segment.failed = false;
      segment.played = false;
      segment.current = segment.target;
      delete segment.layer.dataset.videoPainted;
      delete segment.layer.dataset.videoFailed;
    };

    const layout = () => {
      const pageY = window.scrollY || window.pageYOffset;
      rootTop = root.getBoundingClientRect().top + pageY;
      viewportHeight = window.innerHeight;
      layoutWidth = window.innerWidth;

      for (const segment of runtime) {
        if (
          segment.loadedSource &&
          segment.loadedSource !== sourceFor(segment)
        ) {
          unloadClip(segment);
        }
        const rect = segment.band.getBoundingClientRect();
        segment.start = rect.top + pageY - rootTop;
        segment.end = segment.start + rect.height;
      }
      total = Math.max(runtime.at(-1)?.end ?? viewportHeight, viewportHeight);
      syncFilmAttr();
      dirty = true;
    };

    const primeVideo = async (video?: HTMLVideoElement) => {
      if (!video || !isMobile()) {
        return;
      }
      try {
        await video.play();
        video.pause();
      } catch {
        // Keep the poster; a later user gesture/seek can retry naturally.
      }
    };

    const loadClip = async (segment: RuntimeSegment) => {
      const source = sourceFor(segment);
      if (
        reduceMotion ||
        destroyed ||
        segment.loading ||
        segment.ready ||
        segment.failed ||
        !source
      ) {
        return;
      }

      segment.loading = true;
      segment.loadedSource = source;
      segment.abort = new AbortController();
      const request = segment.abort;

      try {
        let src = source;
        let objectUrl: string | undefined;

        // Scrubbing writes currentTime every frame, and iOS will not seek an
        // HTTP-streamed MP4 accurately, so that path still has to download the
        // whole clip into a blob before the first frame is usable. Playback has
        // no such constraint: streaming lets a frame paint almost immediately
        // instead of after megabytes have landed.
        if (!playMode()) {
          const response = await fetch(source, {
            signal: request.signal,
          });
          if (!response.ok) {
            throw new Error(`Clip failed: ${response.status}`);
          }
          const blob = await response.blob();
          if (
            destroyed ||
            request.signal.aborted ||
            segment.loadedSource !== source
          ) {
            return;
          }
          objectUrl = URL.createObjectURL(blob);
          src = objectUrl;
        }

        const video = document.createElement("video");
        video.className = "scroll-scrub__video";
        video.muted = true;
        video.playsInline = true;
        // "auto" in both modes. Metadata-only made sense against the old
        // multi-megabyte encodes, but a ~0.5 MiB clip is cheap to buffer, and
        // holding back means the chapter is reached before it can play.
        video.preload = "auto";
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");

        video.addEventListener(
          "loadedmetadata",
          () => {
            if (segment.video !== video || segment.loadedSource !== source) {
              return;
            }
            segment.ready = true;
            segment.loading = false;
            dirty = true;

            if (!playMode()) {
              // Force one seek so the decoder commits a frame.
              //
              // At the top of the page the first chapter sits at target 0, and
              // the scrub loop only writes currentTime once it differs from the
              // current position by more than epsilon — so at rest it never
              // writes at all, and no seek is ever issued. Blink papers over
              // that by painting frame 0 of a loaded video by itself; WebKit
              // does not commit a frame for a video that has neither played nor
              // completed a seek, so in Safari the first chapter stayed blank
              // until the visitor scrolled.
              //
              // The floor has to be non-zero: assigning 0 to a currentTime that
              // is already 0 is not a seek and fires nothing. At 24 fps, 1 ms is
              // still inside frame 0, so the frame shown is the poster's own.
              try {
                video.currentTime = Math.max(
                  clamp(segment.target, 0, 0.999) * (video.duration || 1),
                  0.001
                );
              } catch {
                // Not seekable yet; the scroll loop issues the next one.
              }
            }
          },
          { once: true }
        );
        video.addEventListener(
          "loadeddata",
          () => {
            if (
              userReady &&
              segment.video === video &&
              segment.loadedSource === source
            ) {
              void primeVideo(video);
            }
          },
          { once: true }
        );
        video.addEventListener(
          "error",
          () => {
            if (segment.video !== video) {
              return;
            }
            video.remove();
            if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
            }
            delete segment.video;
            delete segment.objectUrl;
            segment.failed = true;
            segment.loading = false;
            segment.ready = false;
            delete segment.layer.dataset.videoPainted;
            segment.layer.dataset.videoFailed = "true";
            if (filmMode() && segment === runtime[0]) {
              // The film is the only video on phones; losing it falls back to
              // the per-chapter posters (the reduced-motion look).
              filmFailed = true;
              syncFilmAttr();
              dirty = true;
            }
          },
          { once: true }
        );
        // Hand over from poster to video as soon as a real frame is up. Which
        // event gets there first depends on the mode: scrubbing paints by
        // seeking, playback by playing — and a play that starts at 0 need not
        // fire "seeked" at all, so both are wired and whichever fires wins.
        const markPainted = () => {
          if (segment.video === video && segment.loadedSource === source) {
            segment.layer.dataset.videoPainted = "true";
          }
        };
        video.addEventListener("seeked", markPainted, { once: true });
        video.addEventListener("playing", markPainted, { once: true });

        // In the DOM before `src`, so the media load algorithm runs on an
        // attached element — WebKit has historically been particular about
        // loading a detached one. Both happen in the same synchronous block,
        // so no media event can arrive between them.
        segment.layer.append(video);
        video.src = src;
        if (objectUrl) {
          segment.objectUrl = objectUrl;
        }
        segment.video = video;
      } catch (error) {
        if (
          request.signal.aborted ||
          (error instanceof Error && error.name === "AbortError") ||
          segment.loadedSource !== source
        ) {
          return;
        }
        segment.layer.dataset.videoFailed = "true";
        segment.failed = true;
        segment.loading = false;
      }
    };

    const readScroll = () => {
      const pageY = window.scrollY || window.pageYOffset;
      const y = clamp(pageY - rootTop, 0, total);
      const crossfade = 0.1 * viewportHeight;
      let currentIndex = 0;

      for (const [index, segment] of runtime.entries()) {
        if (y >= segment.start) {
          currentIndex = index;
        }

        const length = Math.max(segment.end - segment.start, 1);
        const local = clamp((y - segment.start) / length);
        segment.target = segment.linger
          ? lingerEase(local, segment.linger)
          : local;

        let outside = 0;
        if (y < segment.start) {
          outside = segment.start - y;
        }
        if (y > segment.end) {
          outside = y - segment.end;
        }
        let opacity = smoothstep(1 - outside / Math.max(crossfade, 1));
        if (reduceMotion) {
          opacity = outside === 0 ? 1 : 0;
        }
        // One element carries the whole film, so there is no crossfade: the
        // first layer is the picture, always. Without this pin, both layers at
        // a chapter boundary hold opacity 1 and the phone composites two
        // fullscreen videos as its resting state.
        if (filmVisual()) {
          opacity = index === 0 ? 1 : 0;
        }

        segment.visible = opacity > 0.001;
        segment.layer.style.opacity = String(opacity);
        segment.layer.style.zIndex = index === currentIndex ? "2" : "1";

        if (
          y > segment.start - 1.5 * viewportHeight &&
          y < segment.end + 1.5 * viewportHeight
        ) {
          void loadClip(segment);
        }
      }

      const current = runtime[currentIndex];
      const currentLength = Math.max(current.end - current.start, 1);
      const currentProgress = clamp((y - current.start) / currentLength);
      const nextActive =
        current.kind === "connector" && currentProgress >= 0.5
          ? current.nextSectionIndex
          : current.sectionIndex;

      if (nextActive !== active) {
        active = nextActive;
        root.dataset.activeSection = String(active);
        setActiveSection(active);
        onActiveRef.current?.(active);
      }

      root.style.setProperty("--ss-progress", String(clamp(y / total)));

      // Cheap: readScroll only runs on a dirty frame, and a clip reaching
      // `loadedmetadata` sets dirty, so a chapter that becomes ready while it is
      // already on screen still gets started.
      if (activeSegment !== currentIndex) {
        activeSegment = currentIndex;
      }
      if (filmVisual()) {
        updateFilm();
      } else if (playMode()) {
        updatePlayback();
      }
    };

    /**
     * Film driver, dirty frames only. Forward-only: arriving at a chapter
     * extends the playback target to that chapter's end and the film keeps
     * going from wherever it is — world time never jumps at a seam, which is
     * the whole point of the single file. Moving backwards is the one seek:
     * replay that chapter's phase from its first frame. Idempotent per frame,
     * so it also catches the film becoming ready under a chapter that is
     * already on screen, and retries a play() the platform refused once the
     * first gesture arrives.
     */
    const updateFilm = () => {
      const segment = runtime[0];
      const { video } = segment;
      const ends = mobileFilm?.chapterEnds ?? [];
      if (!video || !segment.ready || ends.length === 0) {
        return;
      }
      const chapter = Math.min(
        runtime[activeSegment]?.sectionIndex ?? 0,
        ends.length - 1
      );
      const target = ends[chapter];
      if (target < filmTarget - 0.05) {
        const start = chapter === 0 ? 0.001 : ends[chapter - 1];
        try {
          video.currentTime = start;
        } catch {
          // Not seekable yet; playing on from here still looks continuous.
        }
      }
      filmTarget = target;
      if (video.paused && video.currentTime < filmTarget - 0.05) {
        void video.play().catch(() => {
          // Autoplay refused (iOS Low Power Mode). onFirstGesture retries.
        });
      }
    };

    /** Every frame: stop on the active chapter's end frame. */
    const holdFilmAtTarget = () => {
      const { video } = runtime[0];
      if (video && !video.paused && video.currentTime >= filmTarget - 0.02) {
        video.pause();
      }
    };

    /**
     * Playback driver for mobile. The chapter that is on screen plays from the
     * start; everything else is paused and rewound so swiping back replays it
     * rather than resuming a half-finished clip. Runs only when the active
     * chapter changes, not every frame.
     */
    const updatePlayback = () => {
      for (const [index, segment] of runtime.entries()) {
        const { video } = segment;
        if (!video || !segment.ready) {
          continue;
        }
        if (index === activeSegment) {
          // Start once per arrival. Keying off `video.paused` instead would
          // restart the clip every time the chapter is nudged after it has
          // played out, since a finished video reports itself as paused.
          if (!segment.played) {
            segment.played = true;
            try {
              video.currentTime = 0;
            } catch {
              // A clip still buffering rejects the rewind; it plays from
              // wherever it is, which beats not playing at all.
            }
            void video.play().catch(() => {
              // Autoplay refused (rare for muted + playsinline). Poster stays.
            });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
          // Armed again, so swiping back replays the chapter from its first
          // frame rather than showing the frame it ended on.
          segment.played = false;
        }
      }
    };

    const updateVideos = () => {
      if (playMode()) {
        return;
      }
      for (const segment of runtime) {
        const { video } = segment;
        if (!video || !segment.ready || video.seeking) {
          continue;
        }
        if (
          !segment.visible &&
          Math.abs(segment.current - segment.target) < 0.002
        ) {
          continue;
        }

        segment.current += (segment.target - segment.current) * 0.2;
        const targetTime =
          clamp(segment.current, 0, 0.999) * (video.duration || 1);
        const epsilon = isMobile() ? 0.02 : 0.008;
        if (Math.abs(video.currentTime - targetTime) > epsilon) {
          try {
            video.currentTime = targetTime;
          } catch {
            // Keep the last painted frame while the browser catches up.
          }
        }
      }
    };

    const tick = () => {
      if (destroyed) {
        return;
      }
      if (dirty) {
        dirty = false;
        readScroll();
      }
      updateVideos();
      if (filmVisual()) {
        holdFilmAtTarget();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      dirty = true;
    };
    const onResize = () => {
      if (coarsePointer && window.innerWidth === layoutWidth) {
        return;
      }
      layout();
    };
    const onFirstGesture = () => {
      if (userReady) {
        return;
      }
      userReady = true;
      if (filmVisual()) {
        // updateFilm retries the play() the platform refused before a gesture;
        // primeVideo's play-then-pause would stop a film already in flight.
        dirty = true;
        return;
      }
      for (const segment of runtime) {
        void primeVideo(segment.video);
      }
    };

    controllerRef.current = {
      jumpToSection(index) {
        const segment = runtime.find(
          (candidate) =>
            candidate.kind === "scene" && candidate.sectionIndex === index
        );
        if (!segment) {
          return;
        }
        const top =
          rootTop + segment.start + 0.15 * (segment.end - segment.start);
        window.scrollTo({
          behavior: reduceMotion ? "auto" : "smooth",
          top,
        });
      },
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", layout);
    // Crossing the mobile breakpoint changes the chapter height (see the
    // `100dvh !important` rule in scroll-scrub.css) and the play/scrub mode, but
    // onResize deliberately ignores height-only changes on coarse pointers, so
    // the breakpoint itself has to force the re-measure.
    smallViewport.addEventListener("change", layout);
    window.addEventListener("pointerdown", onFirstGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener("touchstart", onFirstGesture, {
      once: true,
      passive: true,
    });

    layout();
    frame = window.requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      controllerRef.current = null;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", layout);
      smallViewport.removeEventListener("change", layout);
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      root.style.removeProperty("--ss-progress");
      delete root.dataset.activeSection;
      delete root.dataset.filmMode;

      for (const segment of runtime) {
        unloadClip(segment);
        segment.layer.style.removeProperty("opacity");
        segment.layer.style.removeProperty("z-index");
      }
    };
  }, [segments, mobileFilm]);

  if (scenes.length === 0) {
    return null;
  }

  const themeStyle: ThemeStyle = {
    "--ss-accent": theme.accent,
    "--ss-bg": theme.background,
    "--ss-ink": theme.ink,
    "--ss-muted": theme.muted,
  };

  return (
    <section
      className={["scroll-scrub", className].filter(Boolean).join(" ")}
      ref={rootRef}
      style={themeStyle}
    >
      <div className="scroll-scrub__stage">
        <div aria-hidden="true" className="scroll-scrub__media">
          {segments.map((segment, index) => {
            const layerStyle: ThemeStyle = {
              "--ss-mobile-position": segment.mobileObjectPosition,
              "--ss-object-position": segment.objectPosition,
            };
            return (
              <figure
                className={`scroll-scrub__layer scroll-scrub__layer--${segment.kind}`}
                data-scroll-scrub-layer=""
                key={segment.key}
                style={layerStyle}
              >
                <picture className="scroll-scrub__picture">
                  {segment.mobilePoster ? (
                    <source
                      media="(hover: none) and (pointer: coarse), (max-width: 860px)"
                      srcSet={segment.mobilePoster}
                    />
                  ) : null}
                  <img
                    alt=""
                    className="scroll-scrub__poster"
                    decoding="async"
                    // Every layer is absolutely positioned inside the sticky
                    // stage, so all of them count as in-viewport and `lazy`
                    // cannot defer the later posters. Demoting them is what
                    // actually keeps them from racing the first chapter's clip
                    // for bandwidth — they are not looked at until their
                    // chapter is reached.
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    src={segment.poster}
                  />
                </picture>
              </figure>
            );
          })}
        </div>

        <div aria-hidden="true" className="scroll-scrub__progress">
          <span />
        </div>

        <nav aria-label="Scroll chapters" className="scroll-scrub__route">
          {scenes.map((scene, index) => (
            <button
              aria-current={activeSection === index ? "step" : undefined}
              className="scroll-scrub__route-button"
              key={scene.id}
              onClick={() => controllerRef.current?.jumpToSection(index)}
              type="button"
            >
              <span>{scene.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="scroll-scrub__story">
        {segments.map((segment) => {
          const bandStyle: CSSProperties = {
            minHeight: `${Math.max(segment.weight, 0.2) * 100}dvh`,
          };

          if (segment.kind === "connector") {
            return (
              <div
                aria-hidden="true"
                className="scroll-scrub__connector-band"
                data-scroll-scrub-band=""
                key={segment.key}
                style={bandStyle}
              />
            );
          }

          const { scene } = segment;
          if (!scene) {
            return null;
          }
          const Heading = segment.sectionIndex === 0 ? "h1" : "h2";

          return (
            <article
              className="scroll-scrub__chapter"
              data-align={scene.align ?? "left"}
              data-scroll-scrub-band=""
              id={scene.id}
              key={segment.key}
              style={bandStyle}
            >
              <div className="scroll-scrub__chapter-pin">
                <div className="scroll-scrub__copy">
                  {scene.kicker ? (
                    <p className="scroll-scrub__kicker">{scene.kicker}</p>
                  ) : null}
                  <Heading className="scroll-scrub__title">
                    {scene.title}
                  </Heading>
                  <p className="scroll-scrub__body">{scene.body}</p>
                  {scene.tags?.length ? (
                    <ul className="scroll-scrub__tags">
                      {scene.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                  {scene.actions ? (
                    <div className="scroll-scrub__actions">{scene.actions}</div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
