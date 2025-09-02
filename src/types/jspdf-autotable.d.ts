declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: any[][];
      body?: any[][];
      theme?: string;
      headStyles?: any;
      styles?: any;
      columnStyles?: any;
    }) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}
