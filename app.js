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
                    // Optional: stop observing after animation
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
