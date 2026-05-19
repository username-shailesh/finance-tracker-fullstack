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
import com.itextpdf.text.Rectangle;
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

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private FinancialHealthScoreService healthScoreService;

    private static final java.time.format.DateTimeFormatter DATE_FORMATTER = java.time.format.DateTimeFormatter.ofPattern("dd/mm/yyyy");

    /**
     * Generate monthly PDF report
     */
    /**
     * Generate monthly PDF report
     */
    public ByteArrayOutputStream generateMonthlyPDFReport(User user, String month, String currencySymbol) throws DocumentException {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        java.time.format.DateTimeFormatter monthFormatter = java.time.format.DateTimeFormatter.ofPattern("MM/yyyy");
        String formattedMonth = yearMonth.format(monthFormatter);

        List<Expense> expenses = expenseRepository.findByUserAndDateRange(user, monthStart, monthEnd);
        BigDecimal total = expenseRepository.getTotalExpensesByDateRange(user, monthStart, monthEnd);
        total = total != null ? total : BigDecimal.ZERO;

        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. Stylized Header Banner (Royal Indigo Theme)
            Paragraph title = new Paragraph("DETAILED EXPENSE SUMMARY REPORT", 
                new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, new BaseColor(108, 99, 255)));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4f);
            document.add(title);

            Paragraph subtitle = new Paragraph("Personal Monthly Financial Ledger & Transaction Registry", 
                new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.DARK_GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20f);
            document.add(subtitle);

            // Handle symbol compatibility
            String pdfSymbol = currencySymbol;
            if ("₹".equals(currencySymbol)) pdfSymbol = "Rs. ";

            // 2. Metadata Information Block (Beautiful Key-Value Grid)
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(20f);
            metaTable.setWidths(new float[]{1.2f, 1f});

            // Card Style Box
            String displayName = user.getUsername() != null ? user.getUsername() : "User #" + user.getId();
            
            // Left block - User Details
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.setPadding(8f);
            leftCell.addElement(new Paragraph("ACCOUNT HOLDER", new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.GRAY)));
            leftCell.addElement(new Paragraph(displayName, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.DARK_GRAY)));
            leftCell.addElement(new Paragraph(" "));
            leftCell.addElement(new Paragraph("STATEMENT PERIOD", new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.GRAY)));
            leftCell.addElement(new Paragraph(formattedMonth, new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.DARK_GRAY)));
            metaTable.addCell(leftCell);

            // Right block - Financial Highlight Card
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBackgroundColor(new BaseColor(240, 240, 255));
            rightCell.setBorderColor(new BaseColor(108, 99, 255));
            rightCell.setBorderWidth(1f);
            rightCell.setPadding(12f);
            rightCell.addElement(new Paragraph("TOTAL MONTHLY EXPENSES", new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(108, 99, 255))));
            rightCell.addElement(new Paragraph(pdfSymbol + total, new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, new BaseColor(118, 75, 162))));
            rightCell.addElement(new Paragraph("Date Generated: " + LocalDate.now(), new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, BaseColor.GRAY)));
            metaTable.addCell(rightCell);

            document.add(metaTable);

            // 3. Transactions Header Divider
            Paragraph sectionTitle = new Paragraph("Transaction Ledger Details", new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK));
            sectionTitle.setSpacingAfter(8f);
            document.add(sectionTitle);

            // 4. Stylish Table Design
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15f);
            
            // Width ratios
            table.setWidths(new float[]{1.2f, 1.5f, 2.5f, 1.2f, 1.2f});

            // Set customized premium headers
            String[] headers = {"Date", "Category", "Description", "Amount", "Method"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE)));
                cell.setBackgroundColor(new BaseColor(108, 99, 255));
                cell.setPadding(8f);
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                cell.setBorderColor(new BaseColor(220, 220, 220));
                table.addCell(cell);
            }

            java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
            boolean alternateRow = false;

            for (Expense expense : expenses) {
                BaseColor bgColor = alternateRow ? new BaseColor(248, 248, 252) : BaseColor.WHITE;
                
                // Date
                PdfPCell cellDate = new PdfPCell(new Phrase(expense.getExpenseDate().format(dtf), new Font(Font.FontFamily.HELVETICA, 9)));
                cellDate.setBackgroundColor(bgColor);
                cellDate.setPadding(6f);
                cellDate.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cellDate);

                // Category
                PdfPCell cellCat = new PdfPCell(new Phrase(expense.getCategory().getName(), new Font(Font.FontFamily.HELVETICA, 9)));
                cellCat.setBackgroundColor(bgColor);
                cellCat.setPadding(6f);
                cellCat.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cellCat);

                // Description
                PdfPCell cellDesc = new PdfPCell(new Phrase(expense.getDescription() != null ? expense.getDescription() : "", new Font(Font.FontFamily.HELVETICA, 9)));
                cellDesc.setBackgroundColor(bgColor);
                cellDesc.setPadding(6f);
                cellDesc.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cellDesc);

                // Amount
                String itemSymbol = currencySymbol;
                if ("₹".equals(currencySymbol)) itemSymbol = "Rs. ";
                PdfPCell cellAmt = new PdfPCell(new Phrase(itemSymbol + expense.getAmount(), new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.DARK_GRAY)));
                cellAmt.setBackgroundColor(bgColor);
                cellAmt.setPadding(6f);
                cellAmt.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cellAmt);

                // Method
                PdfPCell cellMethod = new PdfPCell(new Phrase(expense.getPaymentMethod(), new Font(Font.FontFamily.HELVETICA, 9)));
                cellMethod.setBackgroundColor(bgColor);
                cellMethod.setPadding(6f);
                cellMethod.setBorderColor(new BaseColor(230, 230, 230));
                table.addCell(cellMethod);

                alternateRow = !alternateRow;
            }

            document.add(table);

            // Footer note
            Paragraph footer = new Paragraph("Thank you for using Finance Tracker. Keep tracking, keep saving!", 
                new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC, BaseColor.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(15f);
            document.add(footer);

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

        // Safe explicit column widths (immune to headless/AWT environment font bugs)
        sheet.setColumnWidth(0, 4000);  // Date
        sheet.setColumnWidth(1, 4500);  // Category
        sheet.setColumnWidth(2, 10000); // Description
        sheet.setColumnWidth(3, 3500);  // Amount
        sheet.setColumnWidth(4, 4500);  // Payment Method

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

    /**
     * Generate custom AI Insights & Financial Health PDF Report
     */
    public ByteArrayOutputStream generateAIInsightsPDFReport(User user, String month, String currencySymbol) throws DocumentException {
        YearMonth yearMonth = YearMonth.parse(month);
        java.time.format.DateTimeFormatter monthFormatter = java.time.format.DateTimeFormatter.ofPattern("MM/yyyy");
        String formattedMonth = yearMonth.format(monthFormatter);

        // Calculate health score
        com.financetracker.dto.FinancialHealthScoreDTO healthScore = healthScoreService.calculateHealthScore(user);
        
        // Generate AI insights
        List<com.financetracker.dto.AIInsightDTO> insights = aiInsightService.generateMonthlyInsights(user);

        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Document Header
            Paragraph title = new Paragraph("AI Insights & Financial Analysis Report", new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(108, 99, 255)));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            Paragraph subtitle = new Paragraph("Personalized Financial Intelligence & Performance Analytics", new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.DARK_GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(new Paragraph(" "));

            // User Info & Metadata
            String displayName = user.getUsername() != null ? user.getUsername() : "User #" + user.getId();
            document.add(new Paragraph("Account Holder: " + displayName, new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
            document.add(new Paragraph("Analysis Period: " + formattedMonth, new Font(Font.FontFamily.HELVETICA, 11)));
            document.add(new Paragraph("Date Generated: " + LocalDate.now(), new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.GRAY)));
            document.add(new Paragraph(" "));

            // Section 1: Financial Health Score
            Paragraph healthTitle = new Paragraph("1. Financial Health Score Summary", new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(118, 75, 162)));
            document.add(healthTitle);
            document.add(new Paragraph(" "));

            PdfPTable scoreTable = new PdfPTable(2);
            scoreTable.setWidthPercentage(100);
            
            // Stylized table header
            PdfPCell c1 = new PdfPCell(new Phrase("Metric Category", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
            c1.setBackgroundColor(new BaseColor(108, 99, 255));
            c1.setPadding(8);
            scoreTable.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Phrase("Score & Status Value", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
            c2.setBackgroundColor(new BaseColor(108, 99, 255));
            c2.setPadding(8);
            scoreTable.addCell(c2);
            
            // Metric Rows
            scoreTable.addCell("Overall Financial Health Rating Score");
            scoreTable.addCell(String.valueOf(healthScore.getOverallScore()) + " / 100");
            
            scoreTable.addCell("Overall Rating");
            scoreTable.addCell(healthScore.getScoreRating());
            
            scoreTable.addCell("Savings Ratio");
            scoreTable.addCell(String.format("%.1f%%", healthScore.getSavingsRatio().multiply(new java.math.BigDecimal("100"))));
            
            scoreTable.addCell("Budget Adherence");
            scoreTable.addCell(healthScore.getBudgetAdherencePercentage() + "%");
            
            scoreTable.addCell("Overspending Frequency (Last 12 Months)");
            scoreTable.addCell(healthScore.getOverspendingFrequency() + " times");
            
            document.add(scoreTable);
            document.add(new Paragraph(" "));

            // Recommendation Box
            Paragraph recHeader = new Paragraph("Strategic Financial Recommendation:", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, new BaseColor(220, 100, 0)));
            document.add(recHeader);
            document.add(new Paragraph(healthScore.getRecommendation(), new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.DARK_GRAY)));
            document.add(new Paragraph(" "));

            // Section 2: AI Spending Insights
            Paragraph insightsTitle = new Paragraph("2. AI-Powered Personal Recommendations", new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, new BaseColor(118, 75, 162)));
            document.add(insightsTitle);
            document.add(new Paragraph(" "));

            if (insights.isEmpty()) {
                document.add(new Paragraph("No high-impact insights detected for this month. Keep tracking your expenses regularly to unlock automated AI advisory insights."));
            } else {
                for (com.financetracker.dto.AIInsightDTO insight : insights) {
                    Paragraph itemTitle = new Paragraph("• [" + insight.getType() + "] " + insight.getCategory(), new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, new BaseColor(59, 130, 246)));
                    document.add(itemTitle);
                    
                    document.add(new Paragraph("Observation: " + insight.getInsight(), new Font(Font.FontFamily.HELVETICA, 10)));
                    document.add(new Paragraph("Strategy: " + insight.getRecommendation(), new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.DARK_GRAY)));
                    if (insight.getImpact() != 0) {
                        String impactSign = insight.getImpact() > 0 ? "+" : "";
                        document.add(new Paragraph("Est. Budget Impact: " + impactSign + insight.getImpact() + "%", new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(16, 185, 129))));
                    }
                    document.add(new Paragraph(" "));
                }
            }

        } finally {
            document.close();
        }

        return baos;
    }
}
