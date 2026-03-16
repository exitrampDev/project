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

async generateNda(nda: any): Promise<string> {

    // path to template
    const templatePath = path.join(process.cwd(), 'src','common','templates','nda', 'nda.hbs');

    // read template
    const templateHtml = await fs.readFile(templatePath, 'utf8');

    // compile handlebars template
    const template = Handlebars.compile(templateHtml);

    // dynamic data
    console.log('NDA Data:====>', nda.createdAt);
    console.log('NDA Data:====>', nda.businessOwnerId.first_name);
    console.log('NDA Data:====>', nda.submittedBy.first_name);
    const html = template({
      ndaDate: nda.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      listingTitle: nda.businessId.listingTitle,
      listingId: nda.businessId._id,
      partyA: nda.businessOwnerId.first_name,
      ownerEmail: nda.businessOwnerId.email,
      ownerResponseOn: nda.sellerResponseOn ? nda.sellerResponseOn.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
      ownerSignature: nda.sellerSignature || '',
      
      partyB: nda.submittedBy.first_name,
      buyerEmail: nda.submittedBy.email,
      buyerSignature: nda.buyerSignature || '',

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