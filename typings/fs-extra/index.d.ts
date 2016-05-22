declare module "fs-promise" {
    export function readFile<T>(fileName: string): Promise<T>;
}