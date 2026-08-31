
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as Handlebars from 'handlebars';

@Injectable()
export class PdfService {
  /**
   * Generate PDF from HTML and save it to uploads/nds
   */
  async generateAndSave(html: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    let pdfBuffer: Buffer;

    try {
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      pdfBuffer = Buffer.from(
        await page.pdf({
          format: 'A4',
          printBackground: true,
        }),
      );
    } finally {
      await browser.close();
    }

    // Define folder path
    const folderPath = path.join(
      process.cwd(),
      'uploads',
      'nds',
    );

    await fs.mkdir(folderPath, {
      recursive: true,
    });

    // Define file name
    const fileName = `${uuid()}.pdf`;
    const filePath = path.join(folderPath, fileName);

    // Save PDF
    await fs.writeFile(filePath, pdfBuffer);

    // Return public path
    return `/uploads/nds/${fileName}`;
  }

  /**
   * Generate NDA PDF from Handlebars template
   */
  async generateNda(nda: any): Promise<string> {
    // Path to template
    const templatePath = path.join(
      process.cwd(),
      'src',
      'common',
      'templates',
      'nda',
      'nda.hbs',
    );

    // Read template
    const templateHtml = await fs.readFile(
      templatePath,
      'utf8',
    );

    // Compile Handlebars template
    const template = Handlebars.compile(templateHtml);

    // Dynamic data
    console.log('NDA Data:', nda.createdAt);
    console.log(
      'Business Owner:',
      nda.businessOwnerId.first_name,
    );
    console.log(
      'Submitted By:',
      nda.submittedBy.first_name,
    );

    const html = template({
      ndaDate: nda.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      listingTitle: nda.businessId.listingTitle,
      listingId: nda.businessId._id,

      partyA: nda.businessOwnerId.first_name,
      ownerEmail: nda.businessOwnerId.email,

      ownerResponseOn: nda.sellerResponseOn
        ? nda.sellerResponseOn.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'N/A',

      ownerSignature: nda.sellerSignature || '',

      partyB: nda.submittedBy.first_name,
      buyerEmail: nda.submittedBy.email,

      buyerSignature: nda.buyerSignature || '',
    });

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });

    let pdfBuffer: Buffer;

    try {
      const page = await browser.newPage();

      // Load HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate A4 PDF
      pdfBuffer = Buffer.from(
        await page.pdf({
          format: 'A4',
          printBackground: true,
        }),
      );
    } finally {
      await browser.close();
    }

    // Define folder path
    const folderPath = path.join(
      process.cwd(),
      'src',
      'common',
      'templates',
      'nda',
    );

    await fs.mkdir(folderPath, {
      recursive: true,
    });

    // Define file name
    const fileName = `${uuid()}.pdf`;
    const filePath = path.join(
      folderPath,
      fileName,
    );

    // Save PDF
    await fs.writeFile(
      filePath,
      pdfBuffer,
    );

    return filePath;
  }
}

