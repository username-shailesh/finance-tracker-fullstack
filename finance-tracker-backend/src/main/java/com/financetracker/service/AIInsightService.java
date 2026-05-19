package com.financetracker.service;

import com.financetracker.dto.AIInsightDTO;
import com.financetracker.entity.Expense;
import com.financetracker.entity.Notification;
import com.financetracker.entity.User;
import com.financetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AIInsightService - Generates AI-driven insights about spending patterns
 * Implements rule-based AI logic for spending analysis and recommendations
 */
@Service
@Transactional
public class AIInsightService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private NotificationService notificationService;
 
    private static final Set<String> ESSENTIAL_CATEGORIES = new HashSet<>(Arrays.asList(
        "FOOD", "RENT", "HEALTH", "BILLS", "UTILITIES", "MEDICINE", "TRANSPORT", "GROCERIES", "EDUCATION"
    ));

    /**
     * Generate insights for current month
     */
    public List<AIInsightDTO> generateMonthlyInsights(User user) {
        List<AIInsightDTO> insights = new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        YearMonth previousMonth = currentMonth.minusMonths(1);
        LocalDate prevMonthStart = previousMonth.atDay(1);
        LocalDate prevMonthEnd = previousMonth.atEndOfMonth();

        // Get expenses
        List<Expense> currentMonthExpenses = expenseRepository.findByUserAndDateRange(user, monthStart, monthEnd);
        List<Expense> previousMonthExpenses = expenseRepository.findByUserAndDateRange(user, prevMonthStart, prevMonthEnd);

        // Calculate totals
        BigDecimal currentTotal = currentMonthExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal previousTotal = previousMonthExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 1. Spending comparison insight
        insights.addAll(analyzeSpendingTrend(currentTotal, previousTotal));

        // 2. Category-wise analysis
        insights.addAll(analyzeCategorySpending(currentMonthExpenses, previousMonthExpenses));

        // 3. Unusual spending detection
        insights.addAll(detectUnusualSpending(currentMonthExpenses));

        // 4. Savings opportunity
        insights.addAll(identifySavingsOpportunities(currentMonthExpenses));

        // 5. Product-specific comparison & action advice
        insights.addAll(detectProductSpecificAdvice(currentMonthExpenses));

        // 6. Rural & traditional local-market advice
        insights.addAll(detectRuralAndTraditionalAdvice(currentMonthExpenses));

        // Notify about high-impact insights
        insights.forEach(insight -> notifyHighImpactInsight(user, insight));

        return insights;
    }

    private void notifyHighImpactInsight(User user, AIInsightDTO insight) {
        // Only notify for significant impact insights to avoid spam
        if (Math.abs(insight.getImpact()) >= 20) {
            String emoji = insight.getType().equals("WARNING") ? "🚨" : "💡";
            String title = insight.getType().equals("WARNING") ? "Spending Alert " + emoji : "New Financial Opportunity " + emoji;
            
            notificationService.createNotification(
                user,
                title,
                insight.getInsight() + ". Recommendation: " + insight.getRecommendation(),
                Notification.NotificationType.UNUSUAL_SPENDING
            );
        }
    }

    /**
     * Analyze spending trend compared to previous month
     */
    private List<AIInsightDTO> analyzeSpendingTrend(BigDecimal current, BigDecimal previous) {
        List<AIInsightDTO> insights = new ArrayList<>();

        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return insights;
        }

        BigDecimal percentChange = current.subtract(previous)
                .multiply(new BigDecimal("100"))
                .divide(previous, 2, java.math.RoundingMode.HALF_UP);

        if (percentChange.compareTo(new BigDecimal("20")) > 0) {
            insights.add(AIInsightDTO.builder()
                    .category("Overall Spending")
                    .insight("Critical: Total spending increased by " + percentChange + "% vs last month")
                    .recommendation("Your spending is outpacing your typical habits. Review 'discretionary' categories like Dining and Entertainment to avoid depleting your emergency fund.")
                    .impact(-percentChange.intValue())
                    .type("WARNING")
                    .build());
        } else if (percentChange.compareTo(new BigDecimal("-20")) < 0) {
            insights.add(AIInsightDTO.builder()
                    .category("Overall Spending")
                    .insight("Great Trend: Spending is down " + percentChange.negate() + "% this month")
                    .recommendation("Consider moving these extra savings into an Emergency Fund or High-Yield Savings Account.")
                    .impact(percentChange.intValue())
                    .type("OPPORTUNITY")
                    .build());
        }

        return insights;
    }

    /**
     * Analyze category-wise spending
     */
    private List<AIInsightDTO> analyzeCategorySpending(List<Expense> current, List<Expense> previous) {
        List<AIInsightDTO> insights = new ArrayList<>();

        Map<String, BigDecimal> currentByCategory = groupByCategory(current);
        Map<String, BigDecimal> previousByCategory = groupByCategory(previous);

        for (String category : currentByCategory.keySet()) {
            BigDecimal currentAmount = currentByCategory.get(category);
            BigDecimal previousAmount = previousByCategory.getOrDefault(category, BigDecimal.ZERO);

            if (previousAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentChange = currentAmount.subtract(previousAmount)
                        .multiply(new BigDecimal("100"))
                        .divide(previousAmount, 2, java.math.RoundingMode.HALF_UP);
 
                if (percentChange.compareTo(new BigDecimal("20")) > 0) {
                    boolean isEssential = ESSENTIAL_CATEGORIES.contains(category.toUpperCase());
                    
                    if (isEssential) {
                        insights.add(AIInsightDTO.builder()
                                .category(category)
                                .insight("Essential Spending Check: " + category + " is up by " + percentChange + "%")
                                .recommendation("Since " + category + " is essential for health and living, don't worry too much, but consider bulk buying or loyalty programs to manage inflation.")
                                .impact(-5) // Low impact on health score because it's essential
                                .type("ANALYSIS")
                                .build());
                    } else {
                        insights.add(AIInsightDTO.builder()
                                .category(category)
                                .insight("Discretionary Spike: " + category + " spending increased by " + percentChange + "%!")
                                .recommendation("This is a 'Want' category. To protect your savings, consider cutting back on " + category + " next month.")
                                .impact(-percentChange.intValue())
                                .type("WARNING")
                                .build());
                    }
                }
            }
        }

        return insights;
    }

    /**
     * Detect unusual spending patterns
     */
    private List<AIInsightDTO> detectUnusualSpending(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();

        if (expenses.isEmpty()) return insights;

        // Find unusually high expenses
        BigDecimal averageAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(expenses.size()), 2, java.math.RoundingMode.HALF_UP);

        BigDecimal threshold = averageAmount.multiply(new BigDecimal("2"));

        List<Expense> unusualExpenses = expenses.stream()
                .filter(e -> e.getAmount().compareTo(threshold) > 0)
                .collect(Collectors.toList());

        if (!unusualExpenses.isEmpty()) {
            unusualExpenses.stream()
                    .limit(3)
                    .forEach(expense -> insights.add(AIInsightDTO.builder()
                            .category(expense.getCategory().getName())
                            .insight("Unusual high expense of " + expense.getAmount() + " detected on " + expense.getExpenseDate())
                            .recommendation("Review this expense - it's " + expense.getAmount()
                                    .divide(averageAmount, 2, java.math.RoundingMode.HALF_UP)
                                    .subtract(BigDecimal.ONE)
                                    .multiply(new BigDecimal("100"))
                                    .setScale(0, java.math.RoundingMode.HALF_UP) + "% above your average")
                            .impact(-25)
                            .type("WARNING")
                            .build()));
        }

        return insights;
    }

    /**
     * Identify savings opportunities
     */
    private List<AIInsightDTO> identifySavingsOpportunities(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();

        Map<String, BigDecimal> byCategory = groupByCategory(expenses);

        // Identify top 3 spending categories
        byCategory.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(3)
                .forEach(entry -> {
                    BigDecimal reduction = entry.getValue().multiply(new BigDecimal("0.1")); // 10% reduction
                    insights.add(AIInsightDTO.builder()
                            .category(entry.getKey())
                            .insight("You could save " + reduction.setScale(2, java.math.RoundingMode.HALF_UP)
                                    + " by reducing " + entry.getKey() + " spending by 10%")
                            .recommendation("Look for alternatives or discounts in " + entry.getKey())
                            .impact(10)
                            .type("OPPORTUNITY")
                            .build());
                });

        return insights;
    }

    /**
     * Scan expense descriptions and provide highly specific, actionable product-level alternatives
     */
    private List<AIInsightDTO> detectProductSpecificAdvice(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();
        if (expenses.isEmpty()) return insights;

        boolean hasSubscription = false;
        boolean hasCoffee = false;
        boolean hasFoodDelivery = false;
        boolean hasRideSharing = false;
        boolean hasGrocery = false;

        for (Expense expense : expenses) {
            String desc = expense.getDescription() != null ? expense.getDescription().toLowerCase() : "";
            
            if (!hasSubscription && (desc.contains("netflix") || desc.contains("spotify") || desc.contains("amazon") || desc.contains("youtube") || desc.contains("hulu") || desc.contains("disney") || desc.contains("hbo") || desc.contains("gym"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Subscriptions")
                        .insight("Subscription bill detected: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("To save on " + expense.getDescription() + ", check if you can switch to an annual billing plan (saves ~20% vs monthly) or opt for ad-supported tiers. Audit all active memberships and cancel unused platforms.")
                        .impact(15)
                        .type("OPPORTUNITY")
                        .build());
                hasSubscription = true;
            }
            
            if (!hasCoffee && (desc.contains("starbucks") || desc.contains("coffee") || desc.contains("cafe") || desc.contains("espresso") || desc.contains("ccd"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Food & Drinks")
                        .insight("High-frequency coffee expense: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Buying café drinks regularly is 4x more expensive than premium home-brewing. Switch from daily café visits to a quality French Press or espresso maker and travel mug to save up to 75% instantly.")
                        .impact(10)
                        .type("OPPORTUNITY")
                        .build());
                hasCoffee = true;
            }

            if (!hasFoodDelivery && (desc.contains("mcdonald") || desc.contains("zomato") || desc.contains("swiggy") || desc.contains("ubereats") || desc.contains("food delivery") || desc.contains("domino") || desc.contains("burger king") || desc.contains("restaurant") || desc.contains("dining"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Food & Drinks")
                        .insight("Food delivery markup found: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Food delivery apps charge up to 30% markup plus high delivery fees. Try direct restaurant ordering and self-pickup, or batch-cook at home. Cooking in bulk is generally 60% cheaper than delivery apps.")
                        .impact(15)
                        .type("OPPORTUNITY")
                        .build());
                hasFoodDelivery = true;
            }

            if (!hasRideSharing && (desc.contains("uber") || desc.contains("ola") || desc.contains("taxi") || desc.contains("grab") || desc.contains("lyft") || desc.contains("cab"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Transport")
                        .insight("Ride-sharing costs detected: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Protect yourself from surge pricing on ride-sharing by scheduling rides in advance, carpooling, or walking short distances. For daily commutes, look into a monthly local transit pass.")
                        .impact(12)
                        .type("OPPORTUNITY")
                        .build());
                hasRideSharing = true;
            }

            if (!hasGrocery && (desc.contains("grocery") || desc.contains("groceries") || desc.contains("walmart") || desc.contains("target") || desc.contains("supermarket") || desc.contains("bigbasket") || desc.contains("dmart") || desc.contains("costco"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Groceries")
                        .insight("Supermarket purchase identified: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("When shopping at supermarkets, opt for high-quality generic/store brands (like Kirkland or Great Value) which are 25-35% cheaper than name brands. Always shop with a pre-written list to avoid impulse buys.")
                        .impact(10)
                        .type("OPPORTUNITY")
                        .build());
                hasGrocery = true;
            }
        }
        return insights;
    }

    /**
     * Scan local, rural, and traditional expenses and provide highly relevant localized financial recommendations
     */
    private List<AIInsightDTO> detectRuralAndTraditionalAdvice(List<Expense> expenses) {
        List<AIInsightDTO> insights = new ArrayList<>();
        if (expenses.isEmpty()) return insights;

        boolean hasKirana = false;
        boolean hasMobileRecharge = false;
        boolean hasLocalCommute = false;
        boolean hasAgriculture = false;
        boolean hasTraditionalSave = false;

        for (Expense expense : expenses) {
            String desc = expense.getDescription() != null ? expense.getDescription().toLowerCase() : "";

            if (!hasKirana && (desc.contains("kirana") || desc.contains("ration") || desc.contains("milk") || desc.contains("vegetables") || desc.contains("bazaar") || desc.contains("local shop") || desc.contains("mandi"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Groceries")
                        .insight("Local Kirana / Market expense: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("For local grocery and Kirana purchases, try purchasing bulk sacks of non-perishable staples (rice, flour, lentils) directly from wholesale dealers or grain markets (mandi) rather than small weekly retail quantities. Wholesale buying saves 15-20% on baseline staple items.")
                        .impact(10)
                        .type("OPPORTUNITY")
                        .build());
                hasKirana = true;
            }

            if (!hasMobileRecharge && (desc.contains("recharge") || desc.contains("mobile") || desc.contains("data") || desc.contains("jio") || desc.contains("airtel") || desc.contains("vi") || desc.contains("talktime"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Bills")
                        .insight("Mobile recharge cost detected: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Optimize your mobile connectivity costs. Check for 84-day or annual prepaid recharge bundles instead of monthly top-ups. Long-term prepaid packs yield 15-25% more data and validity per rupee spent compared to monthly plans.")
                        .impact(8)
                        .type("OPPORTUNITY")
                        .build());
                hasMobileRecharge = true;
            }

            if (!hasLocalCommute && (desc.contains("fuel") || desc.contains("petrol") || desc.contains("diesel") || desc.contains("bus") || desc.contains("train") || desc.contains("bike") || desc.contains("motorcycle") || desc.contains("auto"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Transport")
                        .insight("Local travel/fuel cost detected: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("To save on local transit and fuel, practice group commuting or bike-pooling for daily work. Maintaining proper tire pressure and clean air filters on your motorcycle increases fuel efficiency by up to 10%.")
                        .impact(8)
                        .type("OPPORTUNITY")
                        .build());
                hasLocalCommute = true;
            }

            if (!hasAgriculture && (desc.contains("seed") || desc.contains("fertilizer") || desc.contains("urea") || desc.contains("crop") || desc.contains("farm") || desc.contains("pesticide") || desc.contains("tractor") || desc.contains("irrigation") || desc.contains("agri"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Agriculture")
                        .insight("Agri-input / Farming cost identified: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Look into government cooperative subsidies, bulk agricultural input credit schemes, or organic composting. Buying seeds and fertilizers through government-approved cooperatives can reduce crop input costs by up to 30%.")
                        .impact(15)
                        .type("OPPORTUNITY")
                        .build());
                hasAgriculture = true;
            }

            if (!hasTraditionalSave && (desc.contains("gold") || desc.contains("deposit") || desc.contains("post office") || desc.contains("saving") || desc.contains("chit fund") || desc.contains("fd") || desc.contains("rd"))) {
                insights.add(AIInsightDTO.builder()
                        .category("Savings")
                        .insight("Traditional secure savings / gold detected: '" + expense.getDescription() + "' (" + expense.getAmount() + ")")
                        .recommendation("Traditional Savings Advisor: Village post office schemes, Recurring Deposits (RD), and government-backed micro-savings plans offer highly secure, guaranteed interest rates. Consider setting aside a fixed small sum weekly in secure post office deposits.")
                        .impact(15)
                        .type("OPPORTUNITY")
                        .build());
                hasTraditionalSave = true;
            }
        }
        return insights;
    }

    /**
     * Group expenses by category
     */
    private Map<String, BigDecimal> groupByCategory(List<Expense> expenses) {
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));
    }
}
