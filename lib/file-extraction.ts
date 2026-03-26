export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  try {
    if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      return await extractFromTxt(file);
    } else if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
      return await extractFromPdf(file);
    } else if (
      fileName.endsWith('.docx') ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractFromDocx(file);
    } else if (fileName.endsWith('.md') || fileType === 'text/markdown') {
      return await extractFromTxt(file);
    } else {
      // Try as plain text fallback
      return await extractFromTxt(file);
    }
  } catch (error) {
    console.error('[v0] Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}`);
  }
}

async function extractFromTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      resolve(text.trim());
    };
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

async function extractFromPdf(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist only when needed
    const { pdfjs } = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('[v0] PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF. Ensure the PDF contains text.');
  }
}

async function extractFromDocx(file: File): Promise<string> {
  try {
    // Dynamically import mammoths for docx extraction
    const { extractRawText } = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await extractRawText({ arrayBuffer });

    return result.value.trim();
  } catch (error) {
    console.error('[v0] DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file.');
  }
}
