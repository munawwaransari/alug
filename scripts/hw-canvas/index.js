"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandwritingCanvas = void 0;
class HandwritingCanvas {
    canvasElement;
    _context;
    _lastPosition = null;
    _dragging = false;
    _isEmpty = true;
    constructor(canvasElement) {
        this.canvasElement = canvasElement;
        this._context = canvasElement.getContext('2d');
        // The following are the default settings.
        // If you want to override them, you can get `context` and set values.
        this._context.lineCap = 'round';
        this._context.lineJoin = 'round';
        this._context.lineWidth = 10;
        this._context.strokeStyle = 'black';
        canvasElement.addEventListener('mousedown', () => {
            this.dragStart();
        });
        canvasElement.addEventListener('mouseup', () => {
            this.dragEnd();
        });
        canvasElement.addEventListener('mouseout', () => {
            this.dragEnd();
        });
        canvasElement.addEventListener('mousemove', (event) => {
            const pos = { x: event.offsetX, y: event.offsetY };
            this.draw(pos);
        });
    }
    toBlob(type, quality) {
        return new Promise((resolve) => {
            this.canvasElement.toBlob((result) => {
                resolve(result);
            }, type, quality);
        });
    }
    clear() {
        this._isEmpty = true;
        this._context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
    get context() {
        return this._context;
    }
    get isEmpty() {
        return this._isEmpty;
    }
    dragStart() {
        this._context.beginPath();
        this._dragging = true;
        this._isEmpty = false;
    }
    dragEnd() {
        this._context.closePath();
        this._dragging = false;
        this._lastPosition = null;
    }
    draw(pos) {
        if (!this._dragging) {
            return;
        }
        if (this._lastPosition === null) {
            this._context.moveTo(pos.x, pos.y);
        }
        else {
            this._context.moveTo(this._lastPosition.x, this._lastPosition.y);
        }
        this._context.lineTo(pos.x, pos.y);
        this._context.stroke();
        this._lastPosition = pos;
    }
}
exports.HandwritingCanvas = HandwritingCanvas;
