const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const marked = require('marked');

async function generatePDF() {
  try {
    console.log('📄 Starting PDF generation...');
    
    // Read the markdown file
    const markdownContent = fs.readFileSync('ATTENDANCE_PORTAL_DOCUMENTATION.md', 'utf8');
    
    // Convert markdown to HTML
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Portal Documentation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            
            h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
                font-size: 2.5em;
            }
            
            h2 {
                color: #34495e;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 8px;
                margin-top: 30px;
                font-size: 1.8em;
            }
            
            h3 {
                color: #2c3e50;
                font-size: 1.4em;
                margin-top: 25px;
            }
            
            h4 {
                color: #34495e;
                font-size: 1.2em;
                margin-top: 20px;
            }
            
            code {
                background-color: #f8f9fa;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                color: #e74c3c;
            }
            
            pre {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                overflow-x: auto;
                border-left: 4px solid #3498db;
            }
            
            pre code {
                background: none;
                padding: 0;
                color: #333;
            }
            
            blockquote {
                border-left: 4px solid #3498db;
                margin: 0;
                padding-left: 20px;
                color: #7f8c8d;
                font-style: italic;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            
            th {
                background-color: #3498db;
                color: white;
                font-weight: bold;
            }
            
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            
            .highlight {
                background-color: #fff3cd;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
            }
            
            .success {
                background-color: #d4edda;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #28a745;
            }
            
            .info {
                background-color: #d1ecf1;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #17a2b8;
            }
            
            .warning {
                background-color: #fff3cd;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
            }
            
            .danger {
                background-color: #f8d7da;
                padding: 10px;
                border-radius: 5px;
                border-left: 4px solid #dc3545;
            }
            
            .flow-diagram {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                white-space: pre;
                overflow-x: auto;
            }
            
            .architecture-diagram {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                white-space: pre;
                overflow-x: auto;
                border: 2px solid #3498db;
            }
            
            .toc {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .toc ul {
                list-style-type: none;
                padding-left: 0;
            }
            
            .toc li {
                margin: 5px 0;
            }
            
            .toc a {
                color: #3498db;
                text-decoration: none;
            }
            
            .toc a:hover {
                text-decoration: underline;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            @media print {
                body {
                    font-size: 12px;
                }
                
                h1 {
                    font-size: 24px;
                }
                
                h2 {
                    font-size: 20px;
                }
                
                h3 {
                    font-size: 16px;
                }
                
                .page-break {
                    page-break-before: always;
                }
            }
        </style>
    </head>
    <body>
        ${marked.parse(markdownContent)}
    </body>
    </html>
    `;
    
    // Write HTML to temporary file
    const htmlFile = 'temp_documentation.html';
    fs.writeFileSync(htmlFile, htmlContent);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1200,
      height: 800
    });
    
    // Load the HTML file
    await page.goto(`file://${path.resolve(htmlFile)}`, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    await page.pdf({
      path: 'Attendance_Portal_Documentation.pdf',
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Attendance Portal - Complete Documentation</div>',
      footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    });
    
    // Clean up
    await browser.close();
    fs.unlinkSync(htmlFile);
    
    console.log('✅ PDF generated successfully: Attendance_Portal_Documentation.pdf');
    console.log('📁 File location:', path.resolve('Attendance_Portal_Documentation.pdf'));
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
  }
}

// Check if required packages are installed
function checkDependencies() {
  try {
    require('puppeteer');
    require('marked');
    return true;
  } catch (error) {
    console.log('📦 Installing required dependencies...');
    return false;
  }
}

// Main execution
if (require.main === module) {
  if (checkDependencies()) {
    generatePDF();
  } else {
    console.log('❌ Please install required dependencies first:');
    console.log('npm install puppeteer marked');
  }
}

module.exports = { generatePDF };
