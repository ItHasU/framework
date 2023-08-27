//#region Named types
//------------------------------------------------------------------------------
//-- Named types ---------------------------------------------------------------
//------------------------------------------------------------------------------

/** Can be used either as a Named type or as V. If you use it as V, Named typing will be lost. */
type Named<T extends string, V> = V & { __type: T, __value: V };
/** Can only be used as its Named type */
type StrictNamed<T extends string, V> = { __type: T, __value: V };
/** Get the value type (V) of a [Strict]Named type */
type ValueOfNamed<NT> = NT extends { __value: infer V } ? V : never;
/** Get the type name (T extends string) of a [Strict]Named type */
type TypeOfNamed<NT> = NT extends { __type: infer T extends string } ? T : never;

/** Cast a value to a [Strict]Named type */
function asNamed<NT>(value: ValueOfNamed<NT>): NT {
    return value as NT;
}
/** Convert a [Strict]Named type to its value type (V) */
function asRaw<NT>(value: NT): ValueOfNamed<NT> {
    return value as ValueOfNamed<NT>;
}
/** Convert a Named type to its Strict equivalent */
function asStrict<NT>(named: NT): StrictNamed<TypeOfNamed<NT>, ValueOfNamed<NT>> {
    return named as unknown as StrictNamed<TypeOfNamed<NT>, ValueOfNamed<NT>>;
}
/** Convert a Strict Named type to it non strict equivalent */
function asUnstricted<NT>(named: NT): Named<TypeOfNamed<NT>, ValueOfNamed<NT>> {
    return named as Named<TypeOfNamed<NT>, ValueOfNamed<NT>>;
}

//#endregion


export class NamedTyping<Name extends string, JSType> {
    constructor() { }
}

class String extends NamedTyping<"string", string> { }
class Integer extends NamedTyping<"integer", number> { }
class Boolean extends NamedTyping<"boolean", boolean> { }

const types = {
    string: String,
    number: Number,
    boolean: Boolean,
};

export type Static<T> = T extends NamedTyping<infer Name, infer JSType> ? Named<Name, JSType> : never;

const t1 = new Boolean();
type T1 = Static<Boolean>;

const a: T1 = asNamed("test");
