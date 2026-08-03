/* ==========================================================================
   IMSG G-7/1 WEBSITE INTERACTIVITY SCRIPT (White & Sea Green Edition)
   Features: SPA Router, Chatbot AI, Results Database, 3D Canvas, Gallery, Tilt
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. ADMIN DYNAMIC SETTINGS LOADER
    // ==========================================
    function loadSchoolSettings() {
        const stored = localStorage.getItem('schoolSettings');
        if (!stored) return;
        
        try {
            const settings = JSON.parse(stored);
            
            // 1. Update Ticker Announcements
            const ticker = document.getElementById('announcementTicker');
            if (ticker && settings.announcements && settings.announcements.length) {
                ticker.innerHTML = '';
                settings.announcements.forEach(ann => {
                    if (ann.trim()) {
                        const span = document.createElement('span');
                        span.textContent = ann;
                        ticker.appendChild(span);
                    }
                });
            }
            
            // 2. Update School hours
            const setEl = (id, val) => {
                const el = document.getElementById(id);
                if (el && val) el.textContent = val;
            };
            setEl('timingMonThu', settings.timingMonThu);
            setEl('timingFri', settings.timingFri);
            setEl('timingWeekend', settings.timingWeekend);
            setEl('timingAssembly', settings.timingAssembly);
            setEl('timingRecess', settings.timingRecess);
            
            // 3. Update Bus details
            setEl('busMorningTime', settings.busMorningTime);
            setEl('busAfternoonTime', settings.busAfternoonTime);
            setEl('busMonthlyFee', settings.busMonthlyFee);
            setEl('busActiveRoutes', settings.busActiveRoutes);
            
            const busStatusBadge = document.getElementById('busStatusBadge');
            if (busStatusBadge && settings.busStatus) {
                busStatusBadge.textContent = settings.busStatus;
                if (settings.busStatus === 'Active') {
                    busStatusBadge.style.background = '#22c55e';
                } else if (settings.busStatus === 'Full') {
                    busStatusBadge.style.background = '#eab308';
                } else {
                    busStatusBadge.style.background = '#dc2626';
                }
            }
            
            // 4. Update Principal message
            setEl('principalName', settings.principalName);
            setEl('principalEdu', settings.principalEdu);
            setEl('principalMsg', settings.principalMsg);
            setEl('principalSigName', settings.principalSigName);
            
        } catch (e) {
            console.error("Error loading school settings:", e);
        }
    }
    
    // Execute loader
    loadSchoolSettings();

    // ==========================================
    // 1. DYNAMIC CLIENT-SIDE SPA ROUTER
    // ==========================================
    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function handleRouting() {
        const hash = window.location.hash || '#home';
        
        // Hide all sections with transition
        sections.forEach(sec => {
            sec.classList.remove('active');
        });

        // Show active section
        const activeSection = document.querySelector(hash);
        if (activeSection) {
            activeSection.classList.add('active');
            window.scrollTo(0, 0);
            
            // Run page-specific animations
            if (hash === '#home') {
                startCounters();
            }
        }

        // Update Desktop Navigation active classes
        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Mobile Navigation active classes
        mobileLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('hashchange', handleRouting);
    window.addEventListener('load', handleRouting);


    // ==========================================
    // 2. MOBILE MENU INTERACTIVITY
    // ==========================================
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Close mobile menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });


    // ==========================================
    // 3. STATS COUNT-UP ANIMATION (HOME PAGE)
    // ==========================================
    let countersStarted = false;

    function startCounters() {
        if (countersStarted) return;
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCount = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.ceil(current) + (target > 100 ? "+" : "");
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target + (target > 100 ? "+" : "");
                }
            };
            updateCount();
        });
        countersStarted = true;
    }


    // ==========================================
    // 4. MOUSE TILT EFFECT (3D CARD GLOW)
    // ==========================================
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((centerY - y) / centerY) * 8; // Max 8 deg rotation
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });


    // ==========================================
    // 5. INTERACTIVE GALLERY FILTER & LIGHTBOX
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const track = document.getElementById('galleryGrid');
    const prevBtn = document.getElementById('galleryPrevBtn');
    const nextBtn = document.getElementById('galleryNextBtn');
    
    let currentIndex = 0;
    let autoPlayInterval = null;

    function getVisibleItems() {
        return Array.from(galleryItems).filter(item => item.style.display !== 'none');
    }

    function getItemsPerScreen() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    }

    function updateCarousel() {
        const visibleItems = getVisibleItems();
        const itemsPerScreen = getItemsPerScreen();
        const maxIndex = Math.max(0, visibleItems.length - itemsPerScreen);
        
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        
        if (visibleItems.length === 0) return;

        const gap = 32; // 2rem gap in px
        const itemWidth = visibleItems[0].getBoundingClientRect().width;
        
        const offset = currentIndex * (itemWidth + gap);
        track.style.transform = `translateX(${-offset}px)`;

        // Update button states
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
    }

    function nextSlide() {
        const visibleItems = getVisibleItems();
        const itemsPerScreen = getItemsPerScreen();
        const maxIndex = Math.max(0, visibleItems.length - itemsPerScreen);
        
        if (currentIndex >= maxIndex) {
            currentIndex = 0; // Loop back
        } else {
            currentIndex++;
        }
        updateCarousel();
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            const visibleItems = getVisibleItems();
            const itemsPerScreen = getItemsPerScreen();
            currentIndex = Math.max(0, visibleItems.length - itemsPerScreen);
        }
        updateCarousel();
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, 3000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
    });

    const carouselWrapper = document.querySelector('.gallery-carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // Filter Logic connected to Carousel
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                item.style.transform = '';
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                    item.style.opacity = '1';
                } else {
                    item.style.opacity = '0';
                    item.style.display = 'none';
                }
            });

            currentIndex = 0;
            setTimeout(() => {
                updateCarousel();
            }, 100);
            startAutoPlay();
        });
    });

    window.addEventListener('resize', () => {
        updateCarousel();
    });

    // Initialize Autoplay on page load
    setTimeout(() => {
        updateCarousel();
        startAutoPlay();
    }, 500);

    // Lightbox Logic
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const openLightboxBtns = document.querySelectorAll('.btn-lightbox');

    // School images data (Courtyard and Auditorium included)
    const galleryData = [
        { src: 'assets/images/entrance.jpg', caption: 'School Gate & Entrance Banner: Everyone Has a Chance to Make a Difference' },
        { src: 'assets/images/smart_classroom_original.jpg', caption: 'Secondary Grade Smart Classroom: "Let\'s Fly to a New World"' },
        { src: 'assets/images/sports.jpg', caption: 'Girls Volleyball Practice Session: Fostering Agility and Teamwork' },
        { src: 'assets/images/arts.jpg', caption: 'Student Art Corner: Handmade Paper Bouquets Exhibition' },
        { src: 'assets/images/assembly.jpg', caption: 'Morning Assembly Ground & Area: Fostering Unity, Discipline, and Moral Character' },
        { src: 'assets/images/courtyard.jpg', caption: 'School Courtyard & Gardens: Lush green hedges and refreshing outdoor environment' }
    ];

    let currentImgIndex = 0;

    function openLightbox(index) {
        currentImgIndex = parseInt(index);
        updateLightbox();
        lightboxModal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function updateLightbox() {
        lightboxImg.src = galleryData[currentImgIndex].src;
        lightboxCaption.textContent = galleryData[currentImgIndex].caption;
    }

    openLightboxBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openLightbox(btn.getAttribute('data-index'));
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    lightboxPrev.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex - 1 + galleryData.length) % galleryData.length;
        updateLightbox();
    });

    lightboxNext.addEventListener('click', () => {
        currentImgIndex = (currentImgIndex + 1) % galleryData.length;
        updateLightbox();
    });

    // Close lightbox on clicking backdrop
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Keyboard support for Lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext.click();
        if (e.key === 'Escape') lightboxClose.click();
    });

    // Video Tour Popup
    const videoModal = document.getElementById('videoModal');
    const btnPlayVideo = document.querySelector('.btn-lightbox-video');
    const videoClose = document.getElementById('videoClose');

    btnPlayVideo.addEventListener('click', () => {
        videoModal.classList.add('active');
    });

    videoClose.addEventListener('click', () => {
        videoModal.classList.remove('active');
    });

    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.classList.remove('active');
        }
    });


    // ==========================================
    // 6. EXAMS PORTAL & ONLINE RESULTS CHECKER
    // ==========================================
    const rollSearchInput = document.getElementById('rollSearchInput');
    const btnSearchReport = document.getElementById('btnSearchReport');
    const searchError = document.getElementById('searchError');
    const reportCardDisplay = document.getElementById('reportCardDisplay');
    const btnCloseReport = document.getElementById('btnCloseReport');
    const btnPrintReport = document.getElementById('btnPrintReport');
    
    // Results Mock Database (Updated with School System Sections A, B, C, D)
    const resultsDatabase = {
        "601": {
            name: "Ayesha Khan",
            classSection: "Class VIII - Section A (Middle Section)",
            rollNo: "601",
            subjects: [
                { name: "English", total: 100, obtained: 85, grade: "A", status: "Pass" },
                { name: "Urdu", total: 100, obtained: 90, grade: "A+", status: "Pass" },
                { name: "Mathematics", total: 100, obtained: 95, grade: "A+", status: "Pass" },
                { name: "General Science", total: 100, obtained: 88, grade: "A", status: "Pass" },
                { name: "Islamiat", total: 100, obtained: 92, grade: "A+", status: "Pass" }
            ],
            percentage: "90%",
            gpa: "3.90",
            overallGrade: "A+",
            remarks: "Ayesha is an outstanding student who performs exceptionally well in academic and co-curricular programs. Her dedication to learning is highly commendable!"
        },
        "602": {
            name: "Zainab Fatima",
            classSection: "Class IX - Section D (Matric Tech)",
            rollNo: "602",
            subjects: [
                { name: "English", total: 100, obtained: 76, grade: "B", status: "Pass" },
                { name: "Urdu", total: 100, obtained: 82, grade: "A", status: "Pass" },
                { name: "Mathematics", total: 100, obtained: 65, grade: "C", status: "Pass" },
                { name: "Cosmetology (Matric Tech)", total: 100, obtained: 92, grade: "A+", status: "Pass" },
                { name: "General Science", total: 100, obtained: 72, grade: "B", status: "Pass" },
                { name: "Islamiat", total: 100, obtained: 88, grade: "A", status: "Pass" }
            ],
            percentage: "79.1%",
            gpa: "3.35",
            overallGrade: "B+",
            remarks: "Zainab shows good progress and is polite. Her practical work in the Cosmetology Lab is outstanding. She needs slightly more focus on Mathematics."
        },
        "603": {
            name: "Sana Malik",
            classSection: "Class VI - Section B (Middle Section)",
            rollNo: "603",
            subjects: [
                { name: "English", total: 100, obtained: 92, grade: "A+", status: "Pass" },
                { name: "Urdu", total: 100, obtained: 88, grade: "A", status: "Pass" },
                { name: "Mathematics", total: 100, obtained: 90, grade: "A+", status: "Pass" },
                { name: "General Science", total: 100, obtained: 91, grade: "A+", status: "Pass" },
                { name: "Islamiat", total: 100, obtained: 95, grade: "A+", status: "Pass" }
            ],
            percentage: "91.2%",
            gpa: "3.95",
            overallGrade: "A+",
            remarks: "Sana has a great attention to detail. She displays excellent conceptual understanding and is highly creative in art classes."
        },
        "604": {
            name: "Mariam Bibi",
            classSection: "Class X - Section C (Secondary Section)",
            rollNo: "604",
            subjects: [
                { name: "English", total: 100, obtained: 60, grade: "D", status: "Pass" },
                { name: "Urdu", total: 100, obtained: 70, grade: "C", status: "Pass" },
                { name: "Mathematics", total: 100, obtained: 50, grade: "E", status: "Pass" },
                { name: "General Science", total: 100, obtained: 55, grade: "D", status: "Pass" },
                { name: "Islamiat", total: 100, obtained: 78, grade: "B", status: "Pass" }
            ],
            percentage: "62.6%",
            gpa: "2.10",
            overallGrade: "C",
            remarks: "Mariam is quiet and polite. She needs extensive study sessions and regular mock tests in Mathematics and Physics to improve her board exam results."
        },
        "605": {
            name: "Fatima Noor",
            classSection: "Class VII - Section D (Middle Section)",
            rollNo: "605",
            subjects: [
                { name: "English", total: 100, obtained: 88, grade: "A", status: "Pass" },
                { name: "Urdu", total: 100, obtained: 85, grade: "A", status: "Pass" },
                { name: "Mathematics", total: 100, obtained: 82, grade: "A", status: "Pass" },
                { name: "General Science", total: 100, obtained: 84, grade: "A", status: "Pass" },
                { name: "Islamiat", total: 100, obtained: 90, grade: "A+", status: "Pass" }
            ],
            percentage: "85.8%",
            gpa: "3.65",
            overallGrade: "A",
            remarks: "Fatima maintains a highly consistent academic record. She is well-behaved, helpful to classmates, and holds excellent class attendance."
        }
    };

    function searchResults() {
        const rollNum = rollSearchInput.value.trim();
        searchError.textContent = "";

        if (rollNum === "") {
            searchError.textContent = "Please enter a roll number first.";
            reportCardDisplay.style.display = "none";
            return;
        }

        if (resultsDatabase.hasOwnProperty(rollNum)) {
            const student = resultsDatabase[rollNum];
            
            // Populate details
            document.getElementById('resName').textContent = student.name;
            document.getElementById('resClass').textContent = student.classSection;
            document.getElementById('resRoll').textContent = student.rollNo;
            document.getElementById('resPercentage').textContent = student.percentage;
            document.getElementById('resGPA').textContent = student.gpa;
            document.getElementById('resOverallGrade').textContent = student.overallGrade;
            document.getElementById('resRemarks').textContent = student.remarks;

            // Populate table body
            const tbody = document.getElementById('resultsTableBody');
            tbody.innerHTML = ""; // Clear existing

            student.subjects.forEach(sub => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${sub.name}</strong></td>
                    <td>${sub.total}</td>
                    <td>${sub.obtained}</td>
                    <td><strong>${sub.grade}</strong></td>
                    <td><span class="status-badge pass">${sub.status}</span></td>
                `;
                tbody.appendChild(tr);
            });

            // Display the Card
            reportCardDisplay.style.display = "block";
            reportCardDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            searchError.textContent = "Roll Number not found. Try entering 601, 602, 603, 604, or 605.";
            reportCardDisplay.style.display = "none";
        }
    }

    btnSearchReport.addEventListener('click', searchResults);
    
    // Add enter key support in search input
    rollSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchResults();
    });

    btnCloseReport.addEventListener('click', () => {
        reportCardDisplay.style.display = "none";
        window.scrollTo({ top: document.querySelector('.exams-container').offsetTop - 100, behavior: 'smooth' });
    });

    btnPrintReport.addEventListener('click', () => {
        window.print();
    });


    // ==========================================
    // 7. INQUIRY FORM SUBMISSION (PARENTS)
    // ==========================================
    const inquiryForm = document.getElementById('parentInquiryForm');

    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const parentName = document.getElementById('parentName').value;
        
        // Show simulated success feedback
        alert(`Thank you, Mr./Ms. ${parentName}! Your inquiry has been received. Our administration team will contact you shortly.`);
        inquiryForm.reset();
    });


    // ==========================================
    // 8. CHATBOT ASSISTANT "MINERVA"
    // ==========================================
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    const quickPrompts = document.querySelectorAll('.quick-btn');

    // Toggle window visibility
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
        // Clear new message badge
        document.querySelector('.chatbot-badge').style.display = 'none';
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Bot Response Logic
    const qaPairs = {
        "admission": "Admissions are currently closed. The school is closed for summer vacations and will reopen on 1st August 2026.",
        "timing": "Our school hours are:\n- Monday to Thursday: 8:00 AM to 2:00 PM\n- Friday: 8:00 AM to 12:00 PM\n- Saturday & Sunday: Closed\nAll students must arrive by 7:55 AM for the morning assembly.",
        "uniform": "The girls' uniform for classes 6th to 10th consists of a sky-blue kameez with a white collar, white shalwar, and white dupatta/headscarf. In winter, a navy blue sweater or blazer is added. Black school shoes are mandatory.",
        "principal": "Our school principal is Ms. Aliya Sadaf. She holds an M.A. in English and an M.Phil. She is dedicated to fostering excellent academics, vocational training, and sports. You can read her message on our Home page!",
        "contact": "Address: Opposite to Bhutto Cricket Ground, Street 21, Sector G-7/1, Islamabad. Phone: +92 51 9252086. Email: contact@imsg-g71.edu.pk. Office hours: 8:00 AM to 2:00 PM.",
        "exam": "You can check student report cards online on our 'Exams & Results' page! Try entering test roll numbers like 601, 602 (Matric Tech), 603, 604, or 605 to view sample report cards.",
        "labs": "We have 7 state-of-the-art specialized laboratories: Computer Lab, Chromebook Lab, Smart Lab, Mind Game Room, Science Lab, Home Economics Lab, and the Cosmetology Lab (for Matric Tech). You can view full details and photos on our dedicated 'Laboratories' page!"
    };

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', sender);
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('chat-bubble');
        bubbleDiv.innerText = text;
        
        msgDiv.appendChild(bubbleDiv);
        chatbotMessages.appendChild(msgDiv);
        
        // Auto scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg', 'bot', 'typing-msg');
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('chat-bubble');
        bubbleDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        msgDiv.appendChild(bubbleDiv);
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return msgDiv;
    }

    function handleBotReply(userInput) {
        const query = userInput.toLowerCase();
        let reply = "I'm not sure about that. Try asking about Admissions, Timings, Uniforms, Transport/Bus, Principal Aliya Sadaf, or Results. You can also click the quick buttons above!";
        
        // Retrieve settings from local storage dynamically
        const storedSettings = localStorage.getItem('schoolSettings');
        let settingsObj = null;
        if (storedSettings) {
            try {
                settingsObj = JSON.parse(storedSettings);
            } catch(e) {}
        }

        // Key phrase mapping
        if (query.includes('admission') || query.includes('enroll') || query.includes('apply')) {
            if (settingsObj) {
                const status = settingsObj.admissionsStatus ? settingsObj.admissionsStatus.toUpperCase() : 'CLOSED';
                reply = `Admissions Status: ${status}. \nDetails: ${settingsObj.admissionsDetails || 'Contact administration for details.'}`;
            } else {
                reply = qaPairs.admission;
            }
        } else if (query.includes('time') || query.includes('hours') || query.includes('schedule') || query.includes('recess')) {
            if (settingsObj) {
                reply = `Our school hours are:\n- Monday to Thursday: ${settingsObj.timingMonThu}\n- Friday: ${settingsObj.timingFri}\n- Saturday & Sunday: ${settingsObj.timingWeekend}\n- Morning Assembly: ${settingsObj.timingAssembly}\n- Recess: ${settingsObj.timingRecess}`;
            } else {
                reply = qaPairs.timing;
            }
        } else if (query.includes('transport') || query.includes('bus') || query.includes('route') || query.includes('fare') || query.includes('fee')) {
            if (settingsObj) {
                reply = `School Transport & Bus Service:\n- Morning Pick-up: ${settingsObj.busMorningTime}\n- Afternoon Drop-off: ${settingsObj.busAfternoonTime}\n- Monthly Bus Fee: ${settingsObj.busMonthlyFee}\n- Active Routes: ${settingsObj.busActiveRoutes}\n- Status: ${settingsObj.busStatus}`;
            } else {
                reply = "School Transport & Bus Service:\n- Morning Pick-up: 7:00 AM – 7:45 AM\n- Afternoon Drop-off: 2:15 PM – 3:00 PM\n- Monthly Bus Fee: PKR 2,500\n- Active Routes: G-6, G-7, G-8, G-9, F-6, F-7, Islamabad Highway\n- Status: Active";
            }
        } else if (query.includes('uniform') || query.includes('dress') || query.includes('color') || query.includes('clothes')) {
            reply = qaPairs.uniform;
        } else if (query.includes('principal') || query.includes('headmistress') || query.includes('aliya') || query.includes('sadaf')) {
            if (settingsObj) {
                reply = `Our school principal is ${settingsObj.principalName}. Credentials: ${settingsObj.principalEdu}. Message: "${settingsObj.principalMsg}"`;
            } else {
                reply = qaPairs.principal;
            }
        } else if (query.includes('contact') || query.includes('phone') || query.includes('number') || query.includes('email') || query.includes('address') || query.includes('location') || query.includes('ground')) {
            reply = qaPairs.contact;
        } else if (query.includes('exam') || query.includes('result') || query.includes('report') || query.includes('marks') || query.includes('grade')) {
            reply = qaPairs.exam;
        } else if (query.includes('lab') || query.includes('facility') || query.includes('facilities') || query.includes('infrastructure') || query.includes('computer') || query.includes('science')) {
            reply = qaPairs.labs;
        }

        const typingIndicator = showTypingIndicator();

        setTimeout(() => {
            typingIndicator.remove();
            appendMessage(reply, 'bot');
        }, 800); // 800ms mock delay
    }

    function processUserInput() {
        const text = chatbotInput.value.trim();
        if (text === "") return;
        
        appendMessage(text, 'user');
        chatbotInput.value = "";
        
        handleBotReply(text);
    }

    chatbotSendBtn.addEventListener('click', processUserInput);
    
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') processUserInput();
    });

    // Quick Prompt Clicks
    quickPrompts.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            appendMessage(btn.innerText, 'user');
            
            const typingIndicator = showTypingIndicator();
            setTimeout(() => {
                typingIndicator.remove();
                
                // Get dynamic answer if available
                const storedSettings = localStorage.getItem('schoolSettings');
                let settingsObj = null;
                if (storedSettings) {
                    try {
                        settingsObj = JSON.parse(storedSettings);
                    } catch(e) {}
                }
                
                let reply = qaPairs[query];
                if (settingsObj) {
                    if (query === 'admission') {
                        const status = settingsObj.admissionsStatus ? settingsObj.admissionsStatus.toUpperCase() : 'CLOSED';
                        reply = `Admissions Status: ${status}. \nDetails: ${settingsObj.admissionsDetails || 'Contact administration for details.'}`;
                    } else if (query === 'timing') {
                        reply = `Our school hours are:\n- Monday to Thursday: ${settingsObj.timingMonThu}\n- Friday: ${settingsObj.timingFri}\n- Saturday & Sunday: ${settingsObj.timingWeekend}\n- Morning Assembly: ${settingsObj.timingAssembly}\n- Recess: ${settingsObj.timingRecess}`;
                    } else if (query === 'principal') {
                        reply = `Our school principal is ${settingsObj.principalName}. Credentials: ${settingsObj.principalEdu}. Message: "${settingsObj.principalMsg}"`;
                    }
                }
                appendMessage(reply, 'bot');
            }, 800);
        });
    });


    // ==========================================
    // 9. THREE.JS 3D PARTICLE CANVAS (Subtle Dust)
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    let scene, camera, renderer, particleSystem;

    function init3D() {
        if (!window.THREE) {
            console.error("Three.js not loaded. Falling back.");
            return;
        }
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.setClearColor(0x000000, 0); // Keep canvas transparent

        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x032C6E), // Deep Blue
            new THREE.Color(0x2563eb), // Light Royal Blue
            new THREE.Color(0x021f52)  // Deep Indigo
        ];

        for (let i = 0; i < particleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const radius = 3.8 + Math.random() * 0.7;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = randomColor.r;
            colors[i * 3 + 1] = randomColor.g;
            colors[i * 3 + 2] = randomColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.035, 
            vertexColors: true,
            transparent: true,
            opacity: 0.12, 
            blending: THREE.NormalBlending
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        const starGeometry = new THREE.BufferGeometry();
        const starCount = 100;
        const starPositions = new Float32Array(starCount * 3);
        for(let i=0; i<starCount; i++) {
            starPositions[i*3] = (Math.random() - 0.5) * 45;
            starPositions[i*3+1] = (Math.random() - 0.5) * 45;
            starPositions[i*3+2] = (Math.random() - 0.5) * 45;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ size: 0.015, color: 0x032C6E, transparent: true, opacity: 0.05 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.0004;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.0004;
        });

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            particleSystem.rotation.y = elapsedTime * 0.03;
            particleSystem.rotation.x = elapsedTime * 0.02;

            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    init3D();

    // Navigation listener automatically handles active class and tab highlights

    // ==========================================
    // 10. DAILY UPDATES MODAL DIALOGUE
    // ==========================================
    const updatesModal = document.getElementById('updatesModal');
    const updatesClose = document.getElementById('updatesClose');
    const btnConfirmUpdates = document.getElementById('btnConfirmUpdates');
    const updatesBtns = document.querySelectorAll('.btn-daily-updates');

    if (updatesModal) {
        updatesBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                updatesModal.classList.add('active');
                document.body.classList.add('no-scroll');
            });
        });

        updatesClose.addEventListener('click', () => {
            updatesModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });

        btnConfirmUpdates.addEventListener('click', () => {
            updatesModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });

        // Close on background click
        updatesModal.addEventListener('click', (e) => {
            if (e.target === updatesModal) {
                updatesModal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }

});



