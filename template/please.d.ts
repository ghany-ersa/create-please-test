declare module 'please-test' {
    import { Page, Locator } from '@playwright/test'

    export default class Please {
        constructor(page: Page, test?: import('@playwright/test').TestType<any, any>)
        detectLocator(selector: string): string
        toLocator(selector: string): Locator
        goto(url: string, title?: string): Promise<void>
        verifyPage(url: string, title?: string): Promise<void>
        url(): Promise<string>
        title(): Promise<string>
        untilShow(label: string, selector: string, timeout?: number): Promise<void>
        wait(ms?: number): Promise<void>
        click(label: string, selector: string, delay?: number): Promise<void>
        fill(label: string, selector: string, value: string): Promise<void>
        fillAndEnter(label: string, selector: string, value: string): Promise<void>
        clear(label: string, selector: string): Promise<void>
        scrollTo(label: string, selector: string): Promise<void>
        uploadFile(label: string, selector: string, filePath: string): Promise<void>
        datepicker(label: string, selector: string, value: string): Promise<void>
        see(label: string, selector: string, expected?: string, timeout?: number): Promise<string>
        screenshot(label?: string): Promise<string>
    }
}
