# Bibliography about typings in TypeScript

## Souces

* [Typebox](https://github.com/sinclairzx81/typebox)
* [Arktype](https://arktype.io)
* [Nominal](https://github.com/scalarhq/nominal)
* [Unlocking type-safety superpowers in Typescript with nominal and refinement types](https://zackoverflow.dev/writing/nominal-and-refinement-types-typescript)

## Code

### Value to type

```typescript
export type evaluate<t> = { [k in keyof t]: t[k] } & unknown;

export type isTopType<t> = (any extends t ? true : false) extends true
    ? true
    : false;

type DomainTypes = {
    bigint: bigint
    boolean: boolean
    number: number
    object: object
    string: string
    symbol: symbol
    undefined: undefined
    null: null
};

const isFalse: isTopType<{a: boolean}> = false;
const isTrue: isTopType<any> = true;

export type Domain = evaluate<keyof DomainTypes>;

export type domainOf<data> = isTopType<data> extends true
    ? Domain
    : data extends object
    ? "object"
    : data extends string
    ? "string"
    : data extends number
    ? "number"
    : data extends boolean
    ? "boolean"
    : data extends undefined
    ? "undefined"
    : data extends null
    ? "null"
    : data extends bigint
    ? "bigint"
    : data extends symbol
    ? "symbol"
    : never;

export const domainOf = function<data>(data: data) {
    const builtinType = typeof data
    return (
        builtinType === "object"
            ? data === null
                ? "null"
                : "object"
            : builtinType === "function"
            ? "object"
            : builtinType
    ) as domainOf<data>
}

type infered<T> = T extends keyof DomainTypes ? DomainTypes[T] : never;

type FieldTypes<T extends Record<string, Domain>> = {[key in keyof T]: T[key]};
type DomainFieldTypes<T extends Record<string, Domain>> = {[key in keyof T]: infered<T[key]>};
export function FieldTypes<T extends Record<string, Domain>>(data: T): T & { _types: FieldTypes<T>, _domains: DomainFieldTypes<T>} {
    return data as (T & {_types:FieldTypes<T>, _domains: DomainFieldTypes<T>});
}

const APP_FIELD_TYPES = FieldTypes({
    "TEXT": "string",
    "SMALLINT": "number"
});
type AppFieldTypes = (typeof APP_FIELD_TYPES)["_types"];
type DomainAppFieldTypes = (typeof APP_FIELD_TYPES)["_domains"];

type DTODefinition<FT extends Record<string, Domain>, Def extends Record<string, keyof FT>> = {[k in keyof Def]: infered<FT[Def[k]]>};
function DTODefinition<FT extends Record<string, Domain>, Def extends Record<string, keyof FT>>(definition: Def): Def & { DTO: DTODefinition<FT, Def>} {
    return definition as (Def & { DTO: DTODefinition<FT, Def>});
}


const TYPE_AGENT = DTODefinition<AppFieldTypes, {name: "TEXT", age: "SMALLINT"}>({
    name: "TEXT",
    age: "SMALLINT"
});

type AgentDTO = typeof TYPE_AGENT["DTO"];



```


### Safe value affectation

```typescript
// Inspired by 
// * https://zackoverflow.dev/writing/nominal-and-refinement-types-typescript
// * https://github.com/modfy/nominal

//------------------------------------------------------------------------------
//-- Named types ---------------------------------------------------------------
//------------------------------------------------------------------------------

/** Can be used either as a Named type or as V. If you use it as V, Named typing will be lost. */
type Named<T extends string, V> = V & { __type: T, __value: V};
/** Can only be used as its Named type */
type StrictNamed<T extends string, V> = { __type: T, __value: V};
/** Get the value type (V) of a [Strict]Named type */
type ValueOfNamed<NT> = NT extends { __value : infer V } ? V : never;
/** Get the type name (T extends string) of a [Strict]Named type */
type TypeOfNamed<NT> = NT extends { __type : infer T extends string } ? T : never;

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

//------------------------------------------------------------------------------
//-- With field types ----------------------------------------------------------
//------------------------------------------------------------------------------

type KnownTypes = {
    UnixTimestamp: number;
    Seconds: number;
    MilliSeconds: number;
    LengthInMeter: number;
    LengthInMeterStr: string;
    LengthInMillimeter: number;
}
type AN<T extends keyof KnownTypes> = Named<T, KnownTypes[T]>;

type LengthInMeter = AN<"LengthInMeter">;
type LengthInMeterArray = LengthInMeter[];
type LengthInMeterStr = AN<"LengthInMeterStr">;
type LengthInMillimeter = AN<"LengthInMillimeter">;

function asKnown<T extends keyof KnownTypes>(value: ValueOfNamed<AN<T>>): AN<T> {
    return value as unknown as AN<T>;
}

//------------------------------------------------------------------------------
//-- Use of types --------------------------------------------------------------
//------------------------------------------------------------------------------

function conv(value: LengthInMeter): LengthInMillimeter {
    return asNamed<LengthInMillimeter>(value * 1000);
}

function inv_conv(value: LengthInMillimeter): LengthInMeter {
    return asNamed<LengthInMeter>(value / 1000);
}

// -- Types checking --
const error1: LengthInMeter = asNamed<number>(12);                // Only works with Named types
const error2: LengthInMeter = asNamed<LengthInMeter>("12");       // Only accepts number
const error3: LengthInMeter = asKnown<"LengthInMeter">("12");     // Only accepts number, just another way to call

// -- Type manipulation --
const l1: LengthInMeter = asNamed<LengthInMeter>(12);             // Works !
const l1_str: LengthInMeterStr = l1;                              // Cannot assign incompatible types
const l1_num: LengthInMeter = asNamed<LengthInMeter>(l1_str);     // Cannot convert using as

const l2_mm: LengthInMillimeter = conv(l1);                       // Can use convert
const l2_m: LengthInMeter = inv_conv(l2_mm);                      // Can reverse conversion

const l3_str: LengthInMeterStr = asNamed<LengthInMeterStr>("12"); // Can create from strings
const l3_num: LengthInMeter = l3_str;                             // Cannot convert to number

const lengths: LengthInMeterArray = [l1, inv_conv(l2_mm)];        // Works on arrays

console.log(l1, l2_m, l2_mm);

function NOW(): AN<"UnixTimestamp"> {                             // We are not forced to use 
    return asKnown<"UnixTimestamp">(new Date().getTime());
}

function addSeconds(ts: AN<"UnixTimestamp">, seconds: AN<"Seconds"> | ValueOfNamed<AN<"Seconds">>): AN<"UnixTimestamp"> {
    return asKnown<"UnixTimestamp">(ts + seconds * 1000);
}

let ts = NOW();
let ts2 = addSeconds(ts, 10);
let ts3 = addSeconds(ts, asKnown<"Seconds">(10));

const typeOfSeconds1: TypeOfNamed<AN<"Seconds">> = "Seconds";     // Works
const typeOfSeconds2: TypeOfNamed<AN<"Seconds">> = "Second";      // Type checking works
console.log(ts.__type);                                           // Will display undefined
console.log(ts, ts2, ts3);

//------------------------------------------------------------------------------
//-- With generics -------------------------------------------------------------
//------------------------------------------------------------------------------

type SortedArray<T> = Named<"SortedArray", T[]>;
type TArray<T> = Named<"TArray", T[]>;

function arraySort<T>(arr: TArray<T>): SortedArray<T> {
    const rawArray = asRaw(arr);
    rawArray.sort();
    return asNamed<SortedArray<T>>(rawArray);
}

const arr: TArray<number> = asNamed<TArray<number>>([1, 2, 3]);
const sorted = arraySort(arr);
//    ^?

//------------------------------------------------------------------------------
//-- Be more strict ------------------------------------------------------------
//------------------------------------------------------------------------------

type StrictLengthInMeter = StrictNamed<"LengthInMeter", number>;

const l1_prod = l1 * 10; // Problem here is that l1 gets cast to number :(
//    ^?
const l1_add = l1 + 10;
//    ^?

const l1_strict = asStrict(l1);
//    ^?
const l1s_prod = l1_strict * 10; // Error
const l1s_add  = l1_strict + 10; // Error

const l1_unstricted: LengthInMeter = l1_strict;
const l1_unstricted2 = asUnstricted(l1_strict);
//    ^?

const l2_strict = asNamed<StrictLengthInMeter>(l1);
//    ^?
const l2s_prod = l2_strict * 10; // Error

```