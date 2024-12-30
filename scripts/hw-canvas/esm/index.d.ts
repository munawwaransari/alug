export declare class HandwritingCanvas {
    private canvasElement;
    private _context;
    private _lastPosition;
    private _dragging;
    private _isEmpty;
    constructor(canvasElement: HTMLCanvasElement);
    toBlob(type?: string | undefined, quality?: any): Promise<unknown>;
    clear(): void;
    get context(): CanvasRenderingContext2D;
    get isEmpty(): boolean;
    private dragStart;
    private dragEnd;
    private draw;
}
//# sourceMappingURL=index.d.ts.map