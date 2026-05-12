package com.financetracker.service;

import com.financetracker.entity.Expense;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * ReportService - Generates PDF and Excel reports
 */
@Service
@Transactional
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    private static final java.time.format.DateTimeFormatter DATE_FORMATTER = java.time.format.DateTimeFormatter.ofPattern("dd/mm/yyyy");

    /**
     * Generate monthly PDF report
     */
    public ByteArrayOutputStream generateMonthlyPDFReport(User user, String month, String currencySymbol) throws DocumentException {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndDateRange(user, monthStart, monthEnd);
        BigDecimal total = expenseRepository.getTotalExpensesByDateRange(user, monthStart, monthEnd);
        total = total != null ? total : BigDecimal.ZERO;

        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("Monthly Expense Report", new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // User info
            String displayName = user.getUsername() != null ? user.getUsername() : "User #" + user.getId();
            document.add(new Paragraph("User: " + displayName));
            document.add(new Paragraph("Month: " + month));
            
            // Handle symbol compatibility (Rupee symbol often needs special fonts, fallback to 'Rs.')
            String pdfSymbol = currencySymbol;
            if ("₹".equals(currencySymbol)) pdfSymbol = "Rs. ";
            
            document.add(new Paragraph("Total Expenses: " + pdfSymbol + total));
            document.add(new Paragraph(" "));

            // Create table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);

            addTableHeader(table);

            java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (Expense expense : expenses) {
                table.addCell(expense.getExpenseDate().format(dtf));
                table.addCell(expense.getCategory().getName());
                table.addCell(expense.getDescription() != null ? expense.getDescription() : "");
                
                String itemSymbol = currencySymbol;
                if ("₹".equals(currencySymbol)) itemSymbol = "Rs. ";
                table.addCell(itemSymbol + expense.getAmount());
                
                table.addCell(expense.getPaymentMethod());
            }

            document.add(table);
        } finally {
            document.close();
        }

        return baos;
    }

    /**
     * Generate monthly Excel report
     */
    public ByteArrayOutputStream generateMonthlyExcelReport(User user, String month) throws IOException {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findByUserAndDateRange(user, monthStart, monthEnd);
        BigDecimal total = expenseRepository.getTotalExpensesByDateRange(user, monthStart, monthEnd);
        total = total != null ? total : BigDecimal.ZERO;

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Expenses");

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Date");
        headerRow.createCell(1).setCellValue("Category");
        headerRow.createCell(2).setCellValue("Description");
        headerRow.createCell(3).setCellValue("Amount");
        headerRow.createCell(4).setCellValue("Payment Method");

        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Add data rows
        int rowNum = 1;
        for (Expense expense : expenses) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(expense.getExpenseDate().format(dtf));
            row.createCell(1).setCellValue(expense.getCategory().getName());
            row.createCell(2).setCellValue(expense.getDescription() != null ? expense.getDescription() : "");
            row.createCell(3).setCellValue(expense.getAmount().doubleValue());
            row.createCell(4).setCellValue(expense.getPaymentMethod());
        }

        // Add total row
        Row totalRow = sheet.createRow(rowNum + 1);
        totalRow.createCell(2).setCellValue("Total");
        totalRow.createCell(3).setCellValue(total.doubleValue());

        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos;
    }

    /**
     * Add table header to PDF
     */
    private void addTableHeader(PdfPTable table) {
        String[] headers = {"Date", "Category", "Description", "Amount", "Method"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD)));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            table.addCell(cell);
        }
    }
}
