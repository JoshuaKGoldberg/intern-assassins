declare module "fs-promise" {
    export function readFile<T>(fileName: string): Promise<T>;
    export function exists(fileName: string): Promise<boolean>;
}