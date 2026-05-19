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

    @Autowired
    private AIInsightService aiInsightService;

    @Autowired
    private FinancialHealthScoreService healthScoreService;

    private static final java.time.format.DateTimeFormatter DATE_FORMATTER = java.time.format.DateTimeFormatter.ofPattern("dd/mm/yyyy");

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

            // Title
            Paragraph title = new Paragraph("Detailed Expense Summary Report", new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // User info
            String displayName = user.getUsername() != null ? user.getUsername() : "User #" + user.getId();
            document.add(new Paragraph("User: " + displayName));
            document.add(new Paragraph("Month: " + formattedMonth));
            
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
