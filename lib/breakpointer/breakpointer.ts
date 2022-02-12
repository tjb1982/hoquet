export type Breakpoints = {
    minHeight: number;
    minWidth: number;
}

export default class Breakpointer {
    heightMatcher: MediaQueryList;
    widthMatcher: MediaQueryList;

    constructor(breakpoints: Breakpoints) {
        this.heightMatcher = matchMedia(`(min-height: ${breakpoints.minHeight}px)`);
        this.widthMatcher = matchMedia(`(min-width: ${breakpoints.minWidth}px)`);
    }

    addHandler(handler: (h: boolean, w: boolean) => void): void {
        const job = () => handler(
            this.heightMatcher.matches,
            this.widthMatcher.matches,
        );

        this.heightMatcher.addEventListener("change", job);
        this.widthMatcher.addEventListener("change", job);
        job();
    }
}
