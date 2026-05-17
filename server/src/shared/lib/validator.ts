
type ValidatorType = 'number' | 'string' | 'boolean'
type InferType<T extends ValidatorType | undefined> =
    T extends 'number' ? number :
    T extends 'string' ? string :
    T extends 'boolean' ? boolean :
    never
type ValidatorProps = Record<any, unknown>
export class Validator<T extends ValidatorType | undefined = undefined> {
    private type?: T;
    private isOptional = false;
    private minValue?: number;
    private maxValue?: number;

    number() {
        this.type = 'number' as T
        return this
    }
    string() {
        this.type = 'string' as T
        return this
    }
    boolean() {
        this.type = 'boolean' as T
        return this
    }
    optional() {
        this.isOptional = true;
        return this
    }
    min(value: number) {
        this.minValue = value
        return this
    }
    max(value: number) {
        this.maxValue = value
        return this
    }

    validate(key: string, value: unknown){
        try {

            if (!this.isOptional && !value) {
                throw new Error(`Value ${key} is not given`)
            }

            switch (this.type) {
                case 'number': {
                    const numValue = Number(value)

                    if (isNaN(numValue)) throw new Error(`Value ${key} is not number`);
                    if (this.minValue !== undefined && numValue < this.minValue) {
                        throw new Error(`Value ${key} is smaller than minimum value`);
                    }

                    if (this.maxValue !== undefined && numValue > this.maxValue) {
                        throw new Error(`Value ${key} is more than maximum value`);
                    }
                    return true
                }
                case 'string':
                    if (typeof value !== 'string') {
                        throw new Error(`Value ${key} is not string`);
                    } else return true
                case 'boolean':
                    if (value === 'true' || value === 'false') {
                        throw new Error(`Value ${key} is not boolean`);
                    } else return true
                default:
                    return true
            }
        } catch (err) {
            console.log(err)
        }
    }

}
type SchemaShape = Record<string, Validator<any>>

type InferSchema<T extends SchemaShape> = {
    [K in keyof T]:
    T[K] extends Validator<infer U>
    ? InferType<U>
    : never
}
export class Schema<T extends SchemaShape> {

    constructor(private props: T) { }
    validateSchema(values: ValidatorProps) {

        Object.entries(this.props).every(([key, validator]) => {
            validator.validate(key, values[key])
        })
        return {} as InferSchema<T>
    }
}


