type ValidatorType = 'number' | 'string' | 'boolean'
type InferValidatorType<V> =
    V extends Validator<'number', false> ? number :
    V extends Validator<'string', false> ? string :
    V extends Validator<'boolean', false> ? boolean :
    V extends Validator<'number', true> ? number | undefined :
    V extends Validator<'string', true> ? string | undefined :
    V extends Validator<'boolean', true> ? boolean | undefined :
    never;

export type InferSchema<S> =
    S extends Schema<infer T>
    ? { [K in keyof T]: InferValidatorType<T[K]> }
    : never;

export class Validator<
    T extends ValidatorType,
    O extends boolean = false
> {
    private constructor(
        private readonly type: T,
        private readonly isOptional: O = false as O
    ) { }


    static number(): Validator<'number'> {
        return new Validator('number')
    }
    static string(): Validator<'string'> {
        return new Validator('string')
    }
    static boolean(): Validator<'boolean'> {
        return new Validator('boolean')
    }
    optional(): Validator<T, true> {
        return new Validator<T, true>(this.type, true)
    }


    parse(key: string, value: unknown){
        const missing = value == null || value === '';
        if (missing) {
            if (this.isOptional === false) {
                throw new Error(`${key}: required but missing`)
            }
            return undefined
        }

        switch (this.type) {
            case 'number': {
                const parsedValue = Number(value);
                if (isNaN(parsedValue)) {
                    throw new Error(`${key}: expected number, got "${value}"`)
                }
                return parsedValue
            }
            case 'string': {
                if (typeof value !== 'string') {
                    throw new Error(`${key}: expected string, got "${value}"`)
                }
                return value
            }
            case 'boolean': {
                if (value === true || value === 'true') {
                    return true
                }
                if (value === false || value === 'false') {
                    return false
                }
                throw new Error(`${key}: expected boolean, got "${value}"`)
            }
        }


    }
}

export class Schema<T extends Record<string, Validator<any, any>>> {
    constructor(private readonly shape: T) { }

    parse(values: Record<string, unknown>) {
        const errors: string[] = [];
        const result: Record<string, unknown> = {};

        for (const [key, validator] of Object.entries(this.shape)) {
            try {
                result[key] = validator.parse(key, values[key])
            } catch (err) {
                errors.push(err instanceof Error ? err.message : String(err))
            }
        }

        if (errors.length) throw new Error(`Validation failed: \n${errors.join('\n')}`)

        return result as { [K in keyof T]: InferValidatorType<T[K]> }
    }
}
