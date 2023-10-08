import { NamedTyping } from "../types";

export class JSBool<Name extends string = "boolean"> extends NamedTyping<Name, boolean> { }
export class JSNumber<Name extends string = "number"> extends NamedTyping<Name, number> { }
export class JSString<Name extends string = "string"> extends NamedTyping<Name, string> { }