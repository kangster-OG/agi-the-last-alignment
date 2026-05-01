export type ButtonName =
  | "up"
  | "down"
  | "left"
  | "right"
  | "interact"
  | "dash"
  | "one"
  | "two"
  | "three"
  | "four"
  | "coop"
  | "retry"
  | "escape"
  | "fullscreen";

const KEY_TO_BUTTON: Record<string, ButtonName> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyE: "interact",
  Enter: "interact",
  Space: "dash",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  Digit1: "one",
  Digit2: "two",
  Digit3: "three",
  Digit4: "four",
  KeyC: "coop",
  KeyR: "retry",
  Escape: "escape",
  KeyF: "fullscreen"
};

export class Input {
  private held = new Set<ButtonName>();
  private pressedThisFrame = new Set<ButtonName>();
  private queuedPresses = new Set<ButtonName>();

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", () => this.held.clear());
  }

  beginFrame(): void {
    this.pressedThisFrame = new Set(this.queuedPresses);
    this.queuedPresses.clear();
  }

  isDown(button: ButtonName): boolean {
    return this.held.has(button);
  }

  wasPressed(button: ButtonName): boolean {
    return this.pressedThisFrame.has(button);
  }

  axis(): { x: number; y: number } {
    const x = (this.isDown("right") ? 1 : 0) - (this.isDown("left") ? 1 : 0);
    const y = (this.isDown("down") ? 1 : 0) - (this.isDown("up") ? 1 : 0);
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const button = KEY_TO_BUTTON[event.code];
    if (!button) return;
    if (!this.held.has(button)) {
      this.queuedPresses.add(button);
    }
    this.held.add(button);
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
      event.preventDefault();
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    const button = KEY_TO_BUTTON[event.code];
    if (button) this.held.delete(button);
  };
}
