// ═══════════════════════════════════════════════════════════
//                  GLOBAL VARIABLES
// ═══════════════════════════════════════════════════════════

const navbar = document.querySelector('.navbar');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const eliroxRegBtn = document.getElementById('eliroxRegBtn');
const continueBtn = document.getElementById('continueBtn');
const getCodeForm = document.getElementById('getCodeForm');

let isEliroxRegistered = false;

// ═══════════════════════════════════════════════════════════
//                  NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════════════════════════

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
        scrollTopBtn.classList.add('visible');
    } else {
        navbar.classList.remove('scrolled');
        scrollTopBtn.classList.remove('visible');
    }
});

// ═══════════════════════════════════════════════════════════
//                  MOBILE MENU TOGGLE
// ═══════════════════════════════════════════════════════════

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// ═══════════════════════════════════════════════════════════
//                  SMOOTH SCROLLING
// ═══════════════════════════════════════════════════════════

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if href is just "#" or links to modal
        if (href === '#' || this.hasAttribute('data-modal')) {
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ═══════════════════════════════════════════════════════════
//                  SCROLL TO TOP BUTTON
// ═══════════════════════════════════════════════════════════

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ═══════════════════════════════════════════════════════════
//                  FAQ ACCORDION
// ═══════════════════════════════════════════════════════════

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});

// ═══════════════════════════════════════════════════════════
//                  MULTI-STEP FORM LOGIC
// ═══════════════════════════════════════════════════════════

// Track Elirox registration link click
if (eliroxRegBtn) {
    eliroxRegBtn.addEventListener('click', () => {
        // Set flag that user clicked the registration link
        localStorage.setItem('eliroxRegClicked', 'true');
        
        // Enable continue button after 3 seconds
        setTimeout(() => {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        }, 3000);
        
        // Track with analytics (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'Registration',
                'event_label': 'Elirox Registration Link'
            });
        }
    });
}

// Continue to step 2
if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        if (!continueBtn.disabled) {
            showFormStep(2);
            
            // Track with analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_step', {
                    'event_category': 'Registration',
                    'event_label': 'Step 2 - Enter Email'
                });
            }
        }
    });
}

function showFormStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        
        // Scroll to form
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ═══════════════════════════════════════════════════════════
//                  FORM VALIDATION & SUBMISSION
// ═══════════════════════════════════════════════════════════

if (getCodeForm) {
    getCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            email: document.getElementById('email').value.trim(),
            name: document.getElementById('name').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            confirmElirox: document.getElementById('confirmElirox').checked,
            agreeTerms: document.getElementById('agreeTerms').checked,
            timestamp: new Date().toISOString(),
            source: 'tool.eliroxbot.com'
        };
        
        // Validation
        if (!validateEmail(formData.email)) {
            showNotification('Email không hợp lệ!', 'error');
            return;
        }
        
        if (formData.name.length < 2) {
            showNotification('Vui lòng nhập họ tên!', 'error');
            return;
        }
        
        if (!formData.confirmElirox) {
            showNotification('Vui lòng xác nhận đã đăng ký Elirox!', 'error');
            return;
        }
        
        if (!formData.agreeTerms) {
            showNotification('Vui lòng đồng ý với điều khoản sử dụng!', 'error');
            return;
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        
        try {
            // Submit to backend
            const result = await submitFormData(formData);
            
            if (result.success) {
                // Show success step
                showFormStep(3);
                
                // Send email with code
                await sendCodeEmail(formData.email, formData.name);
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'event_category': 'Registration',
                        'event_label': 'Code Request Success'
                    });
                }
                
                // Save to localStorage for tracking
                localStorage.setItem('dashboardRequested', 'true');
                localStorage.setItem('userEmail', formData.email);
                
            } else {
                throw new Error(result.message || 'Có lỗi xảy ra');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Có lỗi xảy ra. Vui lòng thử lại sau!', 'error');
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Nhận Code Ngay!';
        }
    });
}

// ═══════════════════════════════════════════════════════════
//                  FORM SUBMISSION FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function submitFormData(formData) {
    // Option 1: Submit to Google Sheets (recommended for simplicity)
    return await submitToGoogleSheets(formData);
    
    // Option 2: Submit to your own backend
    // return await submitToBackend(formData);
}

async function submitToGoogleSheets(formData) {
    // Google Apps Script Web App URL
    // You need to deploy a Google Apps Script as a web app
    const SCRIPT_URL = '11R_VDfuhC-Qe-wIusfUyskjSK5n8OJrV38S0VrFyRFk0nbajsh0p1H7V';
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // With no-cors, we can't read the response, so assume success
        return { success: true };
        
    } catch (error) {
        console.error('Google Sheets submission error:', error);
        // Even if there's an error, we'll show success to user
        // and send them the code anyway
        return { success: true };
    }
}

async function submitToBackend(formData) {
    // If you have your own backend API
    const API_URL = 'https://your-backend-api.com/register';
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    
    return await response.json();
}

async function sendCodeEmail(email, name) {
    // This would typically be handled by your backend
    // For now, we'll just simulate sending
    
    const emailData = {
        to: email,
        subject: 'DCA LONG Scanner Dashboard - Code Pine Script',
        name: name,
        template: 'dashboard-code'
    };
    
    // Send via your email service (SendGrid, Mailgun, etc.)
    // This is just a placeholder
    console.log('Email would be sent to:', email);
    
    return { success: true };
}

// ═══════════════════════════════════════════════════════════
//                  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ═══════════════════════════════════════════════════════════
//                  ANIMATION ON SCROLL
// ═══════════════════════════════════════════════════════════

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .benefit-card, .problem-card, .testimonial-card, .step');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ═══════════════════════════════════════════════════════════
//                  MODAL FUNCTIONALITY
// ═══════════════════════════════════════════════════════════

// Create modal HTML dynamically
function createModal(type) {
    const modalContent = {
        terms: {
            title: 'Điều Khoản Sử Dụng',
            content: `
                <h3>1. Chấp Nhận Điều Khoản</h3>
                <p>Bằng cách sử dụng DCA LONG Scanner Dashboard, bạn đồng ý với các điều khoản sử dụng này.</p>
                
                <h3>2. Mục Đích Sử Dụng</h3>
                <p>Dashboard này được cung cấp MIỄN PHÍ với mục đích giáo dục. Công cụ chỉ hỗ trợ phân tích, không phải lời khuyên đầu tư.</p>
                
                <h3>3. Trách Nhiệm Người Dùng</h3>
                <p>Bạn hoàn toàn chịu trách nhiệm cho các quyết định giao dịch của mình. Chúng tôi không chịu trách nhiệm cho bất kỳ khoản lỗ nào.</p>
                
                <h3>4. Quyền Sở Hữu Trí Tuệ</h3>
                <p>Code Pine Script thuộc quyền sở hữu của EliroxBot. Bạn có quyền sử dụng cá nhân, không được phân phối lại thương mại.</p>
                
                <h3>5. Cập Nhật</h3>
                <p>Chúng tôi có quyền cập nhật Dashboard và điều khoản bất cứ lúc nào. Việc tiếp tục sử dụng đồng nghĩa với việc chấp nhận các thay đổi.</p>
            `
        },
        privacy: {
            title: 'Chính Sách Bảo Mật',
            content: `
                <h3>1. Thu Thập Thông Tin</h3>
                <p>Chúng tôi thu thập: Email, Họ tên, Telegram username (optional).</p>
                
                <h3>2. Sử Dụng Thông Tin</h3>
                <p>Thông tin được sử dụng để:</p>
                <ul>
                    <li>Gửi code Dashboard</li>
                    <li>Hỗ trợ kỹ thuật</li>
                    <li>Gửi updates quan trọng</li>
                </ul>
                
                <h3>3. Bảo Mật</h3>
                <p>Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi KHÔNG bán, cho thuê hoặc chia sẻ thông tin với bên thứ ba.</p>
                
                <h3>4. Cookies</h3>
                <p>Website sử dụng cookies để cải thiện trải nghiệm người dùng và theo dõi analytics.</p>
                
                <h3>5. Quyền Của Bạn</h3>
                <p>Bạn có quyền yêu cầu xóa dữ liệu cá nhân bất cứ lúc nào bằng cách liên hệ: support@eliroxbot.com</p>
            `
        },
        disclaimer: {
            title: 'Tuyên Bố Miễn Trừ Trách Nhiệm',
            content: `
                <h3>⚠️ LƯU Ý QUAN TRỌNG</h3>
                
                <p><strong>Dashboard này là CÔNG CỤ HỖ TRỢ PHÂN TÍCH, không phải lời khuyên đầu tư.</strong></p>
                
                <h3>Rủi Ro Trading</h3>
                <p>Trading có rủi ro. Bạn có thể mất tiền. Chỉ trade với số tiền bạn có thể chấp nhận mất.</p>
                
                <h3>Không Đảm Bảo Kết Quả</h3>
                <p>Kết quả trong quá khứ KHÔNG đảm bảo kết quả tương lai. Dashboard cung cấp phân tích dựa trên dữ liệu lịch sử.</p>
                
                <h3>Trách Nhiệm Cá Nhân</h3>
                <p>Mọi quyết định trade đều do BẠN chịu trách nhiệm. Chúng tôi không chịu trách nhiệm cho bất kỳ khoản lỗ nào.</p>
                
                <h3>Khuyến Nghị</h3>
                <ul>
                    <li>✓ Học hỏi liên tục</li>
                    <li>✓ Quản lý rủi ro tốt</li>
                    <li>✓ Không vay mượn để trade</li>
                    <li>✓ Không all-in một lệnh</li>
                    <li>✓ Có chiến lược dài hạn</li>
                </ul>
            `
        }
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <h2>${modalContent[type].title}</h2>
            <div class="modal-body">
                ${modalContent[type].content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        .modal-content {
            position: relative;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            animation: modalSlideIn 0.3s ease;
        }
        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition: 0.3s ease;
        }
        .modal-close:hover {
            background: #ef4444;
            color: white;
            transform: rotate(90deg);
        }
        .modal-body {
            margin-top: 1.5rem;
        }
        .modal-body h3 {
            color: #3b82f6;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        .modal-body p {
            color: #64748b;
            line-height: 1.8;
            margin-bottom: 1rem;
        }
        .modal-body ul {
            margin-left: 1.5rem;
            color: #64748b;
        }
        .modal-body ul li {
            margin-bottom: 0.5rem;
        }
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Close modal functionality
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

// Handle modal links
document.querySelectorAll('[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const modalType = link.getAttribute('data-modal');
        createModal(modalType);
    });
});

// ═══════════════════════════════════════════════════════════
//                  ANALYTICS TRACKING
// ═══════════════════════════════════════════════════════════

// Track important events
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track page sections viewed
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            trackEvent('Section View', 'view', sectionId);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('section[id]').forEach(section => {
    sectionObserver.observe(section);
});

// ═══════════════════════════════════════════════════════════
//                  INITIALIZE ON LOAD
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Check if user has already registered
    const dashboardRequested = localStorage.getItem('dashboardRequested');
    if (dashboardRequested === 'true') {
        // Show a welcome back message or skip to success
        console.log('User already registered');
    }
    
    // Add animation class to elements
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ═══════════════════════════════════════════════════════════
//                  KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    // Press 'Escape' to close mobile menu or modal
    if (e.key === 'Escape') {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        }
        
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }
});

console.log('✅ DCA LONG Scanner Dashboard - Initialized');
