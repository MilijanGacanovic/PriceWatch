// Pricing toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('pricing-toggle');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel = document.getElementById('annual-label');
    const priceAmounts = document.querySelectorAll('.amount');
    const periods = document.querySelectorAll('.period');
    
    let isAnnual = false;

    // Toggle between monthly and annual pricing
    toggle.addEventListener('click', () => {
        isAnnual = !isAnnual;
        toggle.classList.toggle('annual', isAnnual);
        
        // Update active label styling
        if (isAnnual) {
            monthlyLabel.classList.remove('active');
            annualLabel.classList.add('active');
        } else {
            monthlyLabel.classList.add('active');
            annualLabel.classList.remove('active');
        }
        
        // Update prices
        priceAmounts.forEach(amount => {
            const monthlyPrice = parseFloat(amount.dataset.monthly);
            const annualPrice = parseFloat(amount.dataset.annual);
            
            if (isAnnual) {
                // Annual pricing (10 months worth - 2 months free)
                const monthlyEquivalent = Math.round(annualPrice / 12);
                amount.textContent = monthlyEquivalent;
            } else {
                amount.textContent = monthlyPrice;
            }
        });
        
        // Update period text
        periods.forEach(period => {
            if (isAnnual) {
                period.textContent = '/month (billed annually)';
            } else {
                period.textContent = '/month';
            }
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add accessibility: announce pricing changes to screen readers
    toggle.addEventListener('click', () => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = isAnnual 
            ? 'Switched to annual pricing. Save 2 months with annual billing.'
            : 'Switched to monthly pricing.';
        document.body.appendChild(announcement);
        
        // Remove announcement after it's been read
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    });

    // Scroll-in fade animation
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Stop observing after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        fadeInSections.forEach(section => {
            observer.observe(section);
        });
    } else {
        // If user prefers reduced motion, show all sections immediately
        fadeInSections.forEach(section => {
            section.classList.add('is-visible');
        });
    }
});

// ROI Calculator functionality
document.addEventListener('DOMContentLoaded', () => {
    const productsSlider = document.getElementById('products-tracked');
    const changesSlider = document.getElementById('competitor-changes');
    const marginSlider = document.getElementById('avg-margin');
    
    const productsValue = document.getElementById('products-value');
    const changesValue = document.getElementById('changes-value');
    const marginValue = document.getElementById('margin-value');
    
    const roiAmount = document.getElementById('roi-amount');
    const roiExplanation = document.getElementById('roi-explanation');

    // Function to format currency
    function formatCurrency(amount) {
        return '€' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    // Function to calculate ROI using the specified formula
    function calculateROI() {
        const products = parseInt(productsSlider.value);
        const changesPerWeek = parseInt(changesSlider.value);
        const margin = parseInt(marginSlider.value);

        // Validate inputs
        if (isNaN(products) || products < 10 || products > 1000) {
            return { amount: 0, products: 100, changes: 10, margin: 10 };
        }
        if (isNaN(changesPerWeek) || changesPerWeek < 1 || changesPerWeek > 50) {
            return { amount: 0, products: products, changes: 10, margin: 10 };
        }
        if (isNaN(margin) || margin < 1 || margin > 50) {
            return { amount: 0, products: products, changes: changesPerWeek, margin: 10 };
        }

        // ROI Calculation Formula:
        // monthlyEvents = productsTracked * competitorChangesPerWeek * 4
        // captureRate = 0.02 + min(0.08, competitorChangesPerWeek/100)  // 2%-10%
        // estimatedMonthlyImpactEUR = monthlyEvents * captureRate * avgMarginEUR
        
        const monthlyEvents = products * changesPerWeek * 4;
        const captureRate = 0.02 + Math.min(0.08, changesPerWeek / 100);
        const monthlyImpact = monthlyEvents * captureRate * margin;

        return {
            amount: Math.round(monthlyImpact),
            products: products,
            changes: changesPerWeek,
            margin: margin,
            monthlyEvents: monthlyEvents,
            captureRate: captureRate
        };
    }

    // Function to update the ROI display
    function updateROI() {
        const products = parseInt(productsSlider.value);
        const changes = parseInt(changesSlider.value);
        const margin = parseInt(marginSlider.value);

        // Update displayed values
        productsValue.textContent = products;
        changesValue.textContent = changes;
        marginValue.textContent = formatCurrency(margin);

        // Update ARIA attributes
        productsSlider.setAttribute('aria-valuenow', products);
        changesSlider.setAttribute('aria-valuenow', changes);
        marginSlider.setAttribute('aria-valuenow', margin);

        // Calculate and display ROI
        const roi = calculateROI();
        roiAmount.textContent = formatCurrency(roi.amount);
        
        // Update explanation text with calculation details
        const captureRatePercent = (roi.captureRate * 100).toFixed(1);
        roiExplanation.textContent = `With ${products} product${products !== 1 ? 's' : ''} tracked and ${changes} competitor price change${changes !== 1 ? 's' : ''} per week, you'll see approximately ${roi.monthlyEvents.toLocaleString()} monthly pricing events. At a ${captureRatePercent}% capture rate and €${margin} average margin, your estimated monthly revenue impact is ${formatCurrency(roi.amount)}.`;

        // Announce changes to screen readers
        announceROIUpdate(roi.amount);
    }

    // Function to announce ROI updates to screen readers
    function announceROIUpdate(amount) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Estimated monthly revenue impact updated to ${formatCurrency(amount)}`;
        document.body.appendChild(announcement);
        
        // Remove announcement after it's been read
        setTimeout(() => {
            if (announcement.parentNode) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    // Add event listeners to sliders
    productsSlider.addEventListener('input', updateROI);
    changesSlider.addEventListener('input', updateROI);
    marginSlider.addEventListener('input', updateROI);

    // Initial calculation
    updateROI();
});

// Add screen reader only class to CSS dynamically if not already present
if (!document.querySelector('style[data-sr-only]')) {
    const style = document.createElement('style');
    style.setAttribute('data-sr-only', 'true');
    style.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
    `;
    document.head.appendChild(style);
}
