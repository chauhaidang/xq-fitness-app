import { browser } from '@wdio/globals'
import * as fs from 'node:fs'
import * as path from 'node:path'

/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {
    /**
    * Gets the page source (DOM tree) for debugging
    * @returns Promise<string> The page source XML
    */
    public async getPageSource(): Promise<string> {
        return await browser.getPageSource()
    }

    /**
    * Captures and saves the page source (DOM tree) to a file
    * @param screenName The name of the screen (used for filename)
    * @returns Promise<string> The file path where the DOM tree was saved
    */
    public async captureDOMTree(screenName: string): Promise<string> {
        const pageSource = await this.getPageSource();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `dom-tree-${screenName}-${timestamp}.xml`;
        const filepath = path.join(process.cwd(), 'artifacts', 'dom-captures', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, pageSource);
        console.log(`\n📸 DOM Tree captured: ${filepath}`);
        return filepath;
    }

    /**
    * Prints the page source (DOM tree) to console for debugging
    */
    public async printPageSource(): Promise<void> {
        const pageSource = await this.getPageSource();
        console.log('\n========== PAGE SOURCE (DOM TREE) ==========');
        console.log(pageSource);
        console.log('============================================\n');
    }
}

