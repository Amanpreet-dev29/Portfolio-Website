
// ================================
// CONFIGURATION
// Replace this with your actual Render backend URL!
// ================================
const BACKEND_URL = "https://aman-devspace-backend.onrender.com";


// ================================
// 1. Typing Animation
// ================================
const textArray = [
    "Full Stack Developer",
    "AI & ML Student",
    "Problem Solver",
    "DSA Enthusiast"
];

const typingElement = document.getElementById("typing");

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typingElement) return;

    const currentText = textArray[textIndex];

    if (!isDeleting) {
        typingElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(type, 1500);
            return;
        }
    } else {
        typingElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length;
        }
    }

    setTimeout(type, isDeleting ? 50 : 100);
}

// Start typing animation
type();


// ================================
// 2. LeetCode Stats Fetcher
// ================================
async function loadLeetCodeStats() {
    try {
        // Updated to use the live Render backend URL
        const response = await fetch(`${BACKEND_URL}/api/leetcode`);

        if (!response.ok) {
            throw new Error("Failed to fetch LeetCode stats");
        }

        const data = await response.json();

        const solved = document.getElementById("solved");
        const contest = document.getElementById("contest");

        if (solved) {
            solved.innerText = data.totalSolved ?? "N/A";
        }

        if (contest) {
            contest.innerText = data.contestRating ?? "Unrated";
        }
    } catch (error) {
        console.error("LeetCode Error:", error);

        const solved = document.getElementById("solved");
        const contest = document.getElementById("contest");

        if (solved) {
            solved.innerText = "Unavailable";
        }

        if (contest) {
            contest.innerText = "Unavailable";
        }
    }
}

// Fetch stats on load
loadLeetCodeStats();


// ================================
// 3. Global Modal Functions (Certificates)
// ================================
function openCertModal(imageSrc) {
    const modal = document.getElementById("certModal");
    const modalImg = document.getElementById("fullCertImg");
    
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imageSrc;
    }
}

function closeCertModal() {
    const modal = document.getElementById("certModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Close modal when pressing ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeCertModal();
    }
});


// ================================
// 4. DOM Loaded Event Handlers
// ================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Smooth Scroll for Sidebar Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Project Carousel Auto-Slider ---
    const carousels = document.querySelectorAll(".project-carousel");
    carousels.forEach((carousel) => {
        const slides = carousel.querySelectorAll(".carousel-slide");
        if (slides.length <= 1) return;

        let currentIndex = 0;

        setInterval(() => {
            slides[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add("active");
        }, 3000); // Transitions every 3 seconds
    });

    // --- Contact Form Submission Handler ---
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // Safely grab input values using name or fallback selectors
            const formData = {
                firstName: contactForm.querySelector('[name="firstName"]')?.value || contactForm.querySelector('input[placeholder*="First Name"]')?.value,
                lastName: contactForm.querySelector('[name="lastName"]')?.value || contactForm.querySelector('input[placeholder*="Last Name"]')?.value,
                email: contactForm.querySelector('[name="email"]')?.value || contactForm.querySelector('input[placeholder*="Email"]')?.value,
                phone: contactForm.querySelector('[name="phone"]')?.value || contactForm.querySelector('input[placeholder*="Phone"]')?.value,
                message: contactForm.querySelector('[name="message"]')?.value || contactForm.querySelector('textarea')?.value
            };

            try {
                // Updated to point directly to Render backend endpoint
                const response = await fetch(`${BACKEND_URL}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('🎉 Success! Check your inbox now.');
                    contactForm.reset();
                } else {
                    alert('❌ Failed: ' + (result.message || 'Error processing request.'));
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('⚠️ Could not reach server. Please try again later.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
