/**
 * Icon/Image Components from SaGentong Figma Design
 * These components display various icons and images used throughout the application
 *
 * All assets are stored locally in /public/assets/figma-icons/
 */

const imgUserSound = "/assets/figma-icons/user-sound.svg";
const imgArrowFatLinesRight1 = "/assets/figma-icons/arrow-fat-lines-right-1.svg";
const imgHandTap = "/assets/figma-icons/hand-tap.svg";
const imgSealCheck = "/assets/figma-icons/seal-check.svg";
const imgArrowFatLinesRight2 = "/assets/figma-icons/arrow-fat-lines-right-2.svg";
const imgUsersFour = "/assets/figma-icons/users-four.svg";
const imgClockClockwise = "/assets/figma-icons/clock-clockwise.svg";
const imgLine = "/assets/figma-icons/divider-line.svg";

export function UserSound() {
  return (
    <div className="relative size-full" data-name="UserSound" data-node-id="22:271">
      <img
        alt="User Sound Icon"
        className="absolute block max-w-none size-full"
        src={imgUserSound}
      />
    </div>
  );
}

export function ArrowFatLinesRight() {
  return (
    <div className="relative size-full" data-name="ArrowFatLinesRight" data-node-id="22:235">
      <img
        alt="Arrow Right Icon"
        className="absolute block max-w-none size-full"
        src={imgArrowFatLinesRight1}
      />
    </div>
  );
}

export function HandTap() {
  return (
    <div className="relative size-full" data-name="HandTap" data-node-id="22:419">
      <img alt="Hand Tap Icon" className="absolute block max-w-none size-full" src={imgHandTap} />
    </div>
  );
}

export function SealCheck() {
  return (
    <div className="relative size-full" data-name="SealCheck" data-node-id="22:428">
      <img
        alt="Seal Check Icon"
        className="absolute block max-w-none size-full"
        src={imgSealCheck}
      />
    </div>
  );
}

export function ArrowFatLinesRight2() {
  return (
    <div className="relative size-full" data-name="ArrowFatLinesRight" data-node-id="22:239">
      <img
        alt="Arrow Right Icon"
        className="absolute block max-w-none size-full"
        src={imgArrowFatLinesRight2}
      />
    </div>
  );
}

export function UsersFour() {
  return (
    <div className="relative size-full" data-name="UsersFour" data-node-id="22:441">
      <img
        alt="Four Users Icon"
        className="absolute block max-w-none size-full"
        src={imgUsersFour}
      />
    </div>
  );
}

export function ClockClockwise() {
  return (
    <div className="relative size-full" data-name="ClockClockwise" data-node-id="22:455">
      <img
        alt="Clock Clockwise Icon"
        className="absolute block max-w-none size-full"
        src={imgClockClockwise}
      />
    </div>
  );
}

export function DividerLine() {
  return (
    <div className="relative size-full" data-node-id="21:129">
      <div className="absolute inset-[-1.3px_0_0_0]">
        <img alt="Divider Line" className="block max-w-none size-full" src={imgLine} />
      </div>
    </div>
  );
}
