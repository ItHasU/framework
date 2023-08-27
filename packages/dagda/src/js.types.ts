import { NamedTyping } from "./typing";

export class JSBool<Name extends string = "boolean"> extends NamedTyping<Name, boolean> { }
export class JSNumber<Name extends string = "number"> extends NamedTyping<Name, number> { }
