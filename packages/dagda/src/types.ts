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
export function asNamed<NT>(value: ValueOfNamed<NT>): NT {
    return value as NT;
}
/** Convert a [Strict]Named type to its value type (V) */
export function asRaw<NT>(value: NT): ValueOfNamed<NT> {
    return value as ValueOfNamed<NT>;
}
/** Convert a Named type to its Strict equivalent */
export function asStrict<NT>(named: NT): StrictNamed<TypeOfNamed<NT>, ValueOfNamed<NT>> {
    return named as unknown as StrictNamed<TypeOfNamed<NT>, ValueOfNamed<NT>>;
}
/** Convert a Strict Named type to it non strict equivalent */
export function asUnstricted<NT>(named: NT): Named<TypeOfNamed<NT>, ValueOfNamed<NT>> {
    return named as Named<TypeOfNamed<NT>, ValueOfNamed<NT>>;
}

//#endregion


export class NamedTyping<Name extends string, JSType> {
    private _t: Named<Name, JSType>;

    constructor() { }
}

class String extends NamedTyping<"string", string> { }
class Integer extends NamedTyping<"integer", number> { }
class Bool extends NamedTyping<"boolean", boolean> { }
class Length extends NamedTyping<"length_in_meters", number>{ }
class Tmp extends NamedTyping<"tmp", { length: Static<Length> }>{ }

const types = {
    string: String,
    number: Integer,
    boolean: Bool,
};

export type Static<T> = T extends NamedTyping<infer Name, infer JSType> ? Named<Name, JSType> : never;

const t1 = new Bool();
type T1 = Static<Bool>;
type T2 = Static<Tmp>;
type TLength = Static<Length>

const a: T1 = asNamed(true);
const b: T2 = asNamed({ length: asNamed<TLength>(12) });

console.log(b.length);