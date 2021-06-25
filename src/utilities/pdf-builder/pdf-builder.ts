import PDFDocument from 'pdfkit';
import {
  InvalidResponse,
  ValidationFailure,
} from '../../validation-messages/failures';
import ValidationMessage from '../../validation-messages/validation-message';
import { ValidationWarning } from '../../validation-messages/warnings';
import ExampleGroup from '../example-group';
import OASOperation from '../oas-operation';
import fs from 'fs';

const FONT = {
  COLOR: {
    LIGHT_BROWN: '#9D7143',
    DARK_BROWN: '#4C2A00',
    LIGHT_GRAY: '#F3F3F3',
    BLACK: '#000',
    PEACH: '#FEE3C1',
    DARK_GOLD: '#AF851A',
    GREEN: '#24A159',
    RED: '#E63022',
    WHITE: '#FFF',
  },
  SIZE: {
    HEADER_1: 32,
    HEADER_2: 16,
    REGULAR: 14,
    SMALL: 12,
  },
  STYLE: {
    BOLD: 'assets/fonts/SourceSansPro-Bold.ttf',
    REGULAR: 'assets/fonts/SourceSansPro-Regular.ttf',
    CODE: 'Courier',
    CODE_BOLD: 'Courier-Bold',
  },
};

const PAGE_MARGIN = 30;
const MAX_TEXT_WIDTH = 500;
const LINE_GAP = 1.4;
const CODE_STYLE_HEIGHT_ADJUSTMENT = 5;
class PDFBuilder {
  private filename: string;

  private pdf: PDFKit.PDFDocument;

  constructor(filename: string) {
    this.filename = filename;
    this.pdf = new PDFDocument({
      size: 'A4',
      margins: {
        top: 5,
        left: 5,
        bottom: 5,
        right: 5,
      },
      bufferPages: true,
    });
    this.pdf.addPage({ margin: PAGE_MARGIN });
  }

  public addCoverPage = (apiName, version, success, failures?): void => {
    this.pdf.switchToPage(0);
    this.pdf
      .rect(0, 0, 595, 30)
      .fill(FONT.COLOR.PEACH)
      .image('assets/images/loast-logo.png', 50, 80)
      .font(FONT.STYLE.BOLD)
      .fillColor(FONT.COLOR.DARK_BROWN)
      .fontSize(FONT.SIZE.HEADER_1)
      .text('LOAST API Test Report', 70, 250)
      .font(FONT.STYLE.REGULAR)
      .fontSize(FONT.SIZE.HEADER_2)
      .text(`${apiName} ${version}`, 70, 300);
    const today = new Date()
      .toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
      })
      .toUpperCase();
    this.pdf
      .fontSize(FONT.SIZE.HEADER_2)
      .fillColor(FONT.COLOR.LIGHT_BROWN)
      .text(`${today} | LIGHTHOUSE`);
    if (success) {
      this.pdf
        .rect(0, 400, 595, 100)
        .fill(FONT.COLOR.GREEN)
        .fontSize(FONT.SIZE.HEADER_2)
        .fillColor(FONT.COLOR.WHITE)
        .text(
          'SUCCESS: This application has completed the API Testing Process',
          70,
          430,
        );
    } else {
      this.pdf
        .rect(0, 400, 595, 100)
        .fill(FONT.COLOR.RED)
        .fontSize(FONT.SIZE.HEADER_2)
        .fillColor(FONT.COLOR.WHITE)
        .text(
          'FAIL: This application has failed to complete the API Testing Process',
          70,
          430,
        )
        .text(
          `with [${failures?.length} operation${
            failures?.length > 1 ? 's' : ''
          }]`,
        );
    }
    this.pdf
      .image('assets/images/quokka-network.png', 30, 600)
      .image('assets/images/va-logo.png', 360, 660, { fit: [200, 200] })
      .image('assets/images/loast-report-footer.png', 0, 815);
  };

  public addOperationResults = (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    failures: ValidationFailure[],
    warnings: ValidationWarning[],
  ): void => {
    if (failures.length > 0) {
      this.addOperationHeading(operation, exampleGroup, false);
      this.addOperationalFailures(failures);
    } else {
      this.addOperationHeading(operation, exampleGroup, true);
    }
    if (warnings.length > 0) {
      this.addOperationalWarnings(warnings);
    }
  };

  private addOperationHeading = (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    succeeded: boolean,
  ): void => {
    this.pdf
      .fontSize(FONT.SIZE.HEADER_2)
      .fillColor(FONT.COLOR.BLACK)
      .font(FONT.STYLE.BOLD)
      .text(operation.verb.toUpperCase(), PAGE_MARGIN, this.pdf.y, {
        lineGap: LINE_GAP,
        continued: true,
      })
      .fontSize(FONT.SIZE.REGULAR)
      .font(FONT.STYLE.CODE)
      .text(` ${operation.path}: `, this.pdf.x, this.pdf.y + 5, {
        continued: true,
      })
      .fontSize(FONT.SIZE.HEADER_2)
      .font(FONT.STYLE.REGULAR);
    if (succeeded) {
      this.pdf
        .fillColor(FONT.COLOR.GREEN)
        .text('Succeeded', this.pdf.x, this.pdf.y - 5);
    } else {
      this.pdf
        .fillColor(FONT.COLOR.RED)
        .text('Failed', this.pdf.x, this.pdf.y - 5);
    }
    this.pdf
      .fillColor(FONT.COLOR.BLACK)
      .fontSize(FONT.SIZE.REGULAR)
      .text('Operation Id: ', PAGE_MARGIN, this.pdf.y, {
        lineGap: LINE_GAP,
        continued: true,
      })
      .fontSize(FONT.SIZE.SMALL)
      .font(FONT.STYLE.CODE)
      .text(
        operation.operationId,
        this.pdf.x,
        this.pdf.y + CODE_STYLE_HEIGHT_ADJUSTMENT,
      )
      .fontSize(FONT.SIZE.REGULAR)
      .font(FONT.STYLE.REGULAR)
      .text(
        'Example Group Name: ',
        PAGE_MARGIN,
        this.pdf.y - CODE_STYLE_HEIGHT_ADJUSTMENT,
        {
          lineGap: LINE_GAP,
          continued: true,
        },
      )
      .fontSize(FONT.SIZE.SMALL)
      .font(FONT.STYLE.CODE)
      .text(
        exampleGroup.name,
        this.pdf.x,
        this.pdf.y + CODE_STYLE_HEIGHT_ADJUSTMENT,
      );
    this.pdf.y -= CODE_STYLE_HEIGHT_ADJUSTMENT;
    this.pdf.moveDown(1);
  };

  private addOperationalFailures = (failures: ValidationFailure[]): void => {
    if (failures.length === 0) return;
    const failureTypes = this.groupValidations(failures);
    Object.keys(failureTypes).forEach((failureType) => {
      this.addTypeHeader('Error Type ', failureType, FONT.COLOR.RED);
      this.pdf.font(FONT.STYLE.CODE).fontSize(FONT.SIZE.SMALL);
      failureTypes[failureType].forEach((failure) => {
        this.addCodeBlock(failure.toString(), FONT.COLOR.RED);
        this.pdf.y += CODE_STYLE_HEIGHT_ADJUSTMENT * 2;
        if (failure instanceof InvalidResponse) {
          this.addCurl(failure.curl);
        }
      });
      this.pdf.moveDown(1);
    });
  };

  private groupValidations = (
    validations: ValidationMessage[],
  ): { [key: string]: ValidationMessage[] } => {
    const validationSet: { [key: string]: ValidationMessage } = {};
    validations.forEach((validation) => {
      validationSet[validation.toString()] = validation;
    });
    const validationTypes: { [key: string]: ValidationFailure[] } = {};
    Object.values(validationSet).forEach((validation) => {
      const key = validationSet[validation.toString()].constructor.name;
      validationTypes[key] = validationTypes[key]
        ? [...validationTypes[key], validation]
        : [validation];
    });
    return validationTypes;
  };

  private addTypeHeader = (
    typeDescriptor: string,
    typeName: string,
    typeColor: string,
  ): void => {
    this.pdf
      .fontSize(FONT.SIZE.REGULAR)
      .fillColor(FONT.COLOR.BLACK)
      .font(FONT.STYLE.REGULAR)
      .text(typeDescriptor, PAGE_MARGIN, this.pdf.y, {
        lineGap: LINE_GAP,
        continued: true,
      })
      .fontSize(FONT.SIZE.SMALL)
      .font(FONT.STYLE.CODE_BOLD)
      .fillColor(typeColor)
      .text(typeName, this.pdf.x, this.pdf.y + CODE_STYLE_HEIGHT_ADJUSTMENT);
    this.pdf.y -= CODE_STYLE_HEIGHT_ADJUSTMENT;
    this.pdf.moveDown(1);
  };

  private addCodeBlock = (code: string, codeColor: string): void => {
    const height = this.pdf.heightOfString(code, {
      lineGap: LINE_GAP,
      width: MAX_TEXT_WIDTH,
    });
    const rectangleBottom =
      this.pdf.y + height + 3 * CODE_STYLE_HEIGHT_ADJUSTMENT;
    if (this.pdf.page.height < rectangleBottom) {
      this.pdf.addPage();
    }
    this.pdf
      .rect(
        PAGE_MARGIN,
        this.pdf.y,
        MAX_TEXT_WIDTH + 10,
        height + CODE_STYLE_HEIGHT_ADJUSTMENT,
      )
      .fillAndStroke(FONT.COLOR.LIGHT_GRAY, FONT.COLOR.BLACK)
      .fill(codeColor)
      .stroke()
      .text(code, PAGE_MARGIN + 10, this.pdf.y + CODE_STYLE_HEIGHT_ADJUSTMENT, {
        lineGap: LINE_GAP,
        width: MAX_TEXT_WIDTH,
      });
  };

  private addCurl = (curl: string): void => {
    this.pdf
      .moveDown(1)
      .fontSize(FONT.SIZE.SMALL)
      .fillColor(FONT.COLOR.BLACK)
      .font(FONT.STYLE.REGULAR)
      .text('cURL Used: ', PAGE_MARGIN, this.pdf.y, {
        lineGap: LINE_GAP,
      });
    this.addCodeBlock(curl, FONT.COLOR.BLACK);
  };

  private addOperationalWarnings = (warnings: ValidationWarning[]): void => {
    if (warnings.length === 0) return;
    const warningTypes = this.groupValidations(warnings);
    Object.keys(warningTypes).forEach((warningType) => {
      this.addTypeHeader('Warning Type ', warningType, FONT.COLOR.DARK_GOLD);
      this.pdf.font(FONT.STYLE.CODE).fontSize(FONT.SIZE.SMALL);
      warningTypes[warningType].forEach((warning) => {
        this.addCodeBlock(warning.toString(), FONT.COLOR.DARK_GOLD);
        this.pdf.y += CODE_STYLE_HEIGHT_ADJUSTMENT * 2;
      });
      this.pdf.moveDown(1);
    });
  };

  public addResultsSummary = (failingOperations: OASOperation[]): void => {
    if (failingOperations.length === 0) return;
    this.pdf
      .moveDown(1)
      .fillColor(FONT.COLOR.RED)
      .fontSize(FONT.SIZE.HEADER_2)
      .font(FONT.STYLE.REGULAR)
      .text(
        `${failingOperations.length} operation${
          failingOperations.length > 1 ? 's' : ''
        } failed`,
        PAGE_MARGIN,
        this.pdf.y,
        { lineGap: LINE_GAP },
      );
  };

  public build = (): void => {
    const out = fs.createWriteStream(this.filename);
    this.pdf.pipe(out);
    this.pdf.end();
  };
}

export default PDFBuilder;
