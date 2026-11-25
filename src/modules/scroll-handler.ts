import {nextTick} from "vue";
import {Router} from "vue-router";

const RESTORE_MAX_FRAMES = 30;

const savedPositions = new Map<number, number>();
let viewport: HTMLElement | null = null;
let pendingRestore: number | null = null;
let restoreFrame = 0;

function currentEntry(): number | undefined {
    const position = window.history.state?.position;
    return typeof position === 'number' ? position : undefined;
}

function savePosition() {
    const entry = currentEntry();
    if (viewport && entry !== undefined) savedPositions.set(entry, viewport.scrollTop);
}

function scrollViewportTo(target: number) {
    if (!viewport) return;
    cancelAnimationFrame(restoreFrame);
    if (target <= 0) {
        viewport.scrollTop = 0;
        return;
    }
    let frames = 0;
    const attempt = () => {
        if (!viewport) return;
        const reachable = viewport.scrollHeight - viewport.clientHeight >= target;
        if (reachable || frames >= RESTORE_MAX_FRAMES) {
            viewport.scrollTop = target;
            return;
        }
        frames++;
        restoreFrame = requestAnimationFrame(attempt);
    };
    attempt();
}

export function setScrollViewport(element: HTMLElement) {
    viewport?.removeEventListener('scroll', savePosition);
    viewport = element;
    viewport.addEventListener('scroll', savePosition, {passive: true});
}

export function setupScrollRestoration(router: Router) {
    window.history.scrollRestoration = 'manual';

    router.options.history.listen((_to, _from, info) => {
        if (String(info.type) !== 'pop') return;
        const entry = currentEntry();
        pendingRestore = entry !== undefined ? savedPositions.get(entry) ?? 0 : 0;
    });

    router.afterEach((_to, _from, failure) => {
        const target = pendingRestore ?? 0;
        pendingRestore = null;
        if (failure) return;
        nextTick(() => scrollViewportTo(target));
    });
}
