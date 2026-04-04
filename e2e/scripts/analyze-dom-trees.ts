import * as fs from 'node:fs';
import * as path from 'node:path';

interface ElementInfo {
    type: string;
    name?: string;
    label?: string;
    value?: string;
    visible?: string;
    accessible?: string;
    enabled?: string;
}

interface ScreenElements {
    screenName: string;
    elements: ElementInfo[];
}

/**
 * Extract attribute value from XML element string
 */
function getAttribute(xmlLine: string, attrName: string): string | undefined {
    const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
    const match = xmlLine.match(regex);
    return match ? match[1] : undefined;
}

/**
 * Extract element type from XML line
 */
function getElementType(xmlLine: string): string | undefined {
    const match = xmlLine.match(/<([A-Za-z][A-Za-z0-9]*)/);
    return match ? match[1] : undefined;
}

/**
 * Parse XML and extract all elements
 */
function extractElements(xmlContent: string): ElementInfo[] {
    const elements: ElementInfo[] = [];
    const lines = xmlContent.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('<') || trimmed.startsWith('<?') || trimmed.startsWith('</')) {
            continue;
        }
        
        const elementType = getElementType(trimmed);
        if (!elementType) {
            continue;
        }
        
        const name = getAttribute(trimmed, 'name');
        const label = getAttribute(trimmed, 'label');
        const value = getAttribute(trimmed, 'value');
        const visible = getAttribute(trimmed, 'visible');
        const accessible = getAttribute(trimmed, 'accessible');
        const enabled = getAttribute(trimmed, 'enabled');
        
        // Only include elements that have at least name or label (interactive elements)
        if (name || label || elementType.includes('Button') || elementType.includes('TextField') || 
            elementType.includes('Switch') || elementType.includes('StaticText')) {
            elements.push({
                type: elementType,
                name,
                label,
                value,
                visible,
                accessible,
                enabled
            });
        }
    }
    
    return elements;
}

/**
 * Analyze a single DOM tree file
 */
function analyzeDOMFile(filePath: string): ScreenElements {
    const xmlContent = fs.readFileSync(filePath, 'utf-8');
    const screenName = path.basename(filePath, '.xml').replace('dom-tree-', '').split('-').slice(0, -1).join('-');
    
    const elements = extractElements(xmlContent);
    return {
        screenName,
        elements
    };
}

/**
 * Main analysis function
 */
async function analyzeAllDOMTrees() {
    const domCapturesDir = path.join(process.cwd(), 'dom-captures');
    
    if (!fs.existsSync(domCapturesDir)) {
        console.log('❌ dom-captures directory not found. Please run the test first to capture DOM trees.');
        return;
    }
    
    const files = fs.readdirSync(domCapturesDir)
        .filter(file => file.endsWith('.xml'))
        .sort();
    
    if (files.length === 0) {
        console.log('❌ No DOM tree files found in dom-captures directory.');
        return;
    }
    
    console.log(`\n📊 Analyzing ${files.length} DOM tree file(s)...\n`);
    
    const allScreens: ScreenElements[] = [];
    
    for (const file of files) {
        const filePath = path.join(domCapturesDir, file);
        try {
            const screenData = analyzeDOMFile(filePath);
            allScreens.push(screenData);
            console.log(`✅ Analyzed: ${file}`);
        } catch (error) {
            console.error(`❌ Error analyzing ${file}:`, error);
        }
    }
    
    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('ELEMENT ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');
    
    for (const screen of allScreens) {
        console.log(`\n📱 Screen: ${screen.screenName}`);
        console.log(`   Total Elements: ${screen.elements.length}`);
        
        // Group elements by type
        const byType = new Map<string, ElementInfo[]>();
        for (const element of screen.elements) {
            if (!byType.has(element.type)) {
                byType.set(element.type, []);
            }
            byType.get(element.type)!.push(element);
        }
        
        console.log(`   Element Types: ${Array.from(byType.keys()).join(', ')}`);
        
        // Show elements with accessibility identifiers
        const withName = screen.elements.filter(e => e.name);
        if (withName.length > 0) {
            console.log(`\n   Elements with Accessibility Identifiers (${withName.length}):`);
            for (const element of withName.slice(0, 20)) { // Limit to first 20
                console.log(`     - ${element.type}: name="${element.name}"${element.label ? `, label="${element.label}"` : ''}`);
            }
            if (withName.length > 20) {
                console.log(`     ... and ${withName.length - 20} more`);
            }
        }
        
        // Show elements with labels but no name
        const withLabelOnly = screen.elements.filter(e => e.label && !e.name);
        if (withLabelOnly.length > 0) {
            console.log(`\n   Elements with Labels only (${withLabelOnly.length}):`);
            for (const element of withLabelOnly.slice(0, 10)) {
                console.log(`     - ${element.type}: label="${element.label}"`);
            }
            if (withLabelOnly.length > 10) {
                console.log(`     ... and ${withLabelOnly.length - 10} more`);
            }
        }
    }
    
    // Generate selector suggestions
    console.log('\n' + '='.repeat(80));
    console.log('SELECTOR SUGGESTIONS FOR PAGE OBJECTS');
    console.log('='.repeat(80) + '\n');
    
    // Group by screen
    const screenGroups = new Map<string, ScreenElements[]>();
    for (const screen of allScreens) {
        const baseName = screen.screenName.split('-')[0];
        if (!screenGroups.has(baseName)) {
            screenGroups.set(baseName, []);
        }
        screenGroups.get(baseName)!.push(screen);
    }
    
    for (const [screenGroup, screens] of screenGroups) {
        console.log(`\n📄 ${screenGroup.charAt(0).toUpperCase() + screenGroup.slice(1)} Page Object:`);
        
        // Collect all unique elements across all screens in this group
        const allElements = new Map<string, ElementInfo>();
        for (const screen of screens) {
            for (const element of screen.elements) {
                if (element.name) {
                    allElements.set(element.name, element);
                }
            }
        }
        
        if (allElements.size > 0) {
            console.log('\n   Suggested selectors:');
            for (const [name] of allElements) {
                const selectorName = name.replace(/-/g, '').replace(/([A-Z])/g, '$1').toLowerCase();
                console.log(`   public get ${selectorName}() {`);
                console.log(`       return $('~${name}');`);
                console.log(`   }`);
            }
        }
    }
    
    // Save detailed JSON report
    const reportPath = path.join(domCapturesDir, 'element-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(allScreens, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}\n`);
}

// Run analysis
analyzeAllDOMTrees().catch(console.error);

