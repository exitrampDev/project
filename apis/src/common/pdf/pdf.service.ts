import { Injectable } from '@nestjs/common';
import * as htmlToPdf from 'html-pdf-node';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as Handlebars from 'handlebars';

@Injectable()
export class PdfService {
  async generateAndSave(html: string): Promise<string> {
    // Define PDF options
    const options = { format: 'A4' };

    // Create PDF buffer
    const file = { content: html };
    const pdfBuffer = await htmlToPdf.generatePdf(file, options);

    // Define folder path
    const folderPath = path.join(process.cwd(), 'uploads', 'nds');
    await fs.mkdir(folderPath, { recursive: true });

    // Define file name
    const fileName = `${uuid()}.pdf`;
    const filePath = path.join(folderPath, fileName);

    // Save PDF
    await fs.writeFile(filePath, pdfBuffer);

    // Return public path
    return `/uploads/nds/${fileName}`;
  }

async generateNda(): Promise<string> {

    // path to template
    const templatePath = path.join(process.cwd(), 'src','common','templates','nda', 'nda.hbs');

    // read template
    const templateHtml = await fs.readFile(templatePath, 'utf8');

    // compile handlebars template
    const template = Handlebars.compile(templateHtml);

    // dynamic data
    const html = template({
      company: 'ABC Technologies',
      client: 'John Doe',
      date: new Date().toLocaleDateString(),
    });

    const options = { format: 'A4' };

    const file = { content: html };

    const pdfBuffer = await htmlToPdf.generatePdf(file, options);

    const folderPath = path.join(process.cwd(), 'src','common','templates','nda',);
    await fs.mkdir(folderPath, { recursive: true });

    const fileName = `${uuid()}.pdf`;
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, pdfBuffer);

    return `${filePath}`;
  }
}