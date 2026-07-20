const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function testWithRealPDF() {
  const dataBuffer = fs.readFileSync('./uploads/OfficeTime.pdf');
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  console.log(result.text);
}

testWithRealPDF();