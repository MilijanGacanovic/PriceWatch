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

    // Function to calculate ROI
    function calculateROI() {
        const products = parseInt(productsSlider.value);
        const changesPerWeek = parseInt(changesSlider.value);
        const margin = parseInt(marginSlider.value);

        // Calculation logic:
        // Assume you can respond to price changes and make competitive adjustments
        // Conservative estimate: 10% of price changes lead to competitive advantage
        // Each competitive response protects/adds revenue equal to the margin
        const WEEKS_PER_MONTH = 4;
        const SUCCESS_RATE = 0.1; // 10% of price changes result in competitive advantage
        
        const changesPerMonth = changesPerWeek * WEEKS_PER_MONTH;
        const effectiveChanges = Math.floor(changesPerMonth * SUCCESS_RATE);
        const monthlyImpact = effectiveChanges * margin;

        return {
            amount: monthlyImpact,
            products: products,
            changes: changesPerWeek,
            margin: margin
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
        
        // Update explanation text
        roiExplanation.textContent = `By tracking ${products} product${products !== 1 ? 's' : ''} and responding to ${changes} price change${changes !== 1 ? 's' : ''} per week with an average margin of ${formatCurrency(margin)}, you could potentially save or add approximately ${formatCurrency(roi.amount)} per month by staying competitive.`;

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
