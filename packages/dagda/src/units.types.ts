import { JSNumber } from "./js.types";
import { Static, asNamed } from "./typing";

export class LengthInMeters extends JSNumber<"LengthInMeters"> { }
export class LengthInMilliMeters extends JSNumber<"LengthInMilliMeters"> { }

export type T_LengthInMeters = Static<LengthInMeters>;
export type T_LengthInMilliMeters = Static<LengthInMilliMeters>;
