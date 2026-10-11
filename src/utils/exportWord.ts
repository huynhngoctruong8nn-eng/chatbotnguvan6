import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from 'docx';
import { ChatMessage } from '../types.ts';

/**
 * Clean markdown formatting markers for clear Word document presentation
 */
function cleanMarkdownForWord(text: string): string {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

/**
 * Trigger download of a Blob as a file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Export a single answer / Q&A pair to Microsoft Word (.docx)
 */
export async function exportAnswerToDocx(
  questionText: string,
  answerContent: string,
  lessonTag?: string
): Promise<void> {
  const cleanAnswer = cleanMarkdownForWord(answerContent);
  const paragraphs: Paragraph[] = [];

  // Header Title
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'TRƯỜNG THCS - BỘ MÔN NGỮ VĂN 6',
          bold: true,
          size: 26,
          font: 'Times New Roman',
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'TÀI LIỆU HƯỚNG DẪN ÔN TẬP VÀ GIẢI ĐÁP CÂU HỎI',
          bold: true,
          size: 28,
          font: 'Times New Roman',
          color: 'B45309', // Amber-700
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: 'Trợ lý học tập: Cô Minh Ngọc AI | Nguồn: Tài liệu chuẩn 113 trang (Bài 1 - Bài 10)',
          italics: true,
          size: 20,
          font: 'Times New Roman',
          color: '475569',
        }),
      ],
    })
  );

  // Question Box / Heading
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: '1. CÂU HỎI CỦA HỌC SINH:',
          bold: true,
          size: 24,
          font: 'Times New Roman',
          color: '1E3A8A',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: questionText || 'Câu hỏi ôn tập môn Ngữ văn 6',
          italics: true,
          size: 24,
          font: 'Times New Roman',
          color: '1E293B',
        }),
      ],
    })
  );

  // Answer Section
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: '2. HƯỚNG DẪN GIẢI CHI TIẾT & GÓC TIẾNG ANH (CÔ MINH NGỌC AI):',
          bold: true,
          size: 24,
          font: 'Times New Roman',
          color: 'B45309',
        }),
      ],
    })
  );

  // Split lines and build styled paragraphs
  const answerLines = cleanAnswer.split('\n');
  for (const line of answerLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    const isHeading = trimmed.startsWith('📌') || trimmed.startsWith('💡') || trimmed.startsWith('🇬🇧') || trimmed.startsWith('👉');
    paragraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: trimmed,
            bold: isHeading,
            size: isHeading ? 23 : 22,
            font: 'Times New Roman',
            color: isHeading ? '0F172A' : '334155',
          }),
        ],
      })
    );
  }

  // Footer / Signature info
  paragraphs.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} lúc ${new Date().toLocaleTimeString('vi-VN')}`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
          color: '64748B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: 'ChatBot Môn Ngữ Văn 6 – Cô Minh Ngọc AI',
          bold: true,
          size: 20,
          font: 'Times New Roman',
          color: 'D97706',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `Dap_an_Ngu_van_6_${Date.now()}.docx`;
  downloadBlob(blob, safeFilename);
}

/**
 * Export full chat history to Microsoft Word (.docx)
 */
export async function exportFullChatToDocx(messages: ChatMessage[]): Promise<void> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'TRƯỜNG THCS - BỘ MÔN NGỮ VĂN 6',
          bold: true,
          size: 28,
          font: 'Times New Roman',
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'SỔ TAY TỔNG HỢP CÂU HỎI VÀ ĐÁP ÁN ÔN TẬP',
          bold: true,
          size: 26,
          font: 'Times New Roman',
          color: 'B45309',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: 'Cô Minh Ngọc AI – Dựa trên tài liệu chuẩn 113 trang (Bài 1 - Bài 10)',
          italics: true,
          size: 20,
          font: 'Times New Roman',
          color: '475569',
        }),
      ],
    }),
  ];

  let qCount = 1;
  for (const msg of messages) {
    if (msg.role === 'user') {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: `❓ Câu hỏi ${qCount++}: ${msg.content}`,
              bold: true,
              size: 24,
              font: 'Times New Roman',
              color: '1E3A8A',
            }),
          ],
        })
      );
    } else {
      const cleanContent = cleanMarkdownForWord(msg.content);
      const lines = cleanContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const isHeading = trimmed.startsWith('📌') || trimmed.startsWith('💡') || trimmed.startsWith('🇬🇧') || trimmed.startsWith('👉');
        paragraphs.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: trimmed,
                bold: isHeading,
                size: isHeading ? 22 : 21,
                font: 'Times New Roman',
                color: isHeading ? '0F172A' : '334155',
              }),
            ],
          })
        );
      }
      paragraphs.push(new Paragraph({ spacing: { after: 180 } }));
    }
  }

  paragraphs.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} | ChatBot Môn Ngữ Văn 6`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
          color: '64748B',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `Tong_hop_Ngu_van_6_${Date.now()}.docx`;
  downloadBlob(blob, safeFilename);
}
