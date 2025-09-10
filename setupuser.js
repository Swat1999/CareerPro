document.addEventListener('DOMContentLoaded', function() {
    const setupWelcomeMessage = document.getElementById('setupWelcomeMessage');
    const sections = document.querySelectorAll('.setup-section');
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const saveAndStartBtn = document.getElementById('saveAndStartBtn');
    const profileSetupForm = document.getElementById('profileSetupForm');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');

    let currentStep = 0; 

    //Logout button (on bottom)
    const logoutProfileButton = document.getElementById('logoutProfileButton');
    if (logoutProfileButton) {
        logoutProfileButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser');
            // Redirect to the landing page (e.g., index.html)
            window.location.href = 'index.html';
        });
    }

    // --- Helper function to update the welcome message ---
    const userName = localStorage.getItem('loggedInUser'); 
    if (userName) {
        setupWelcomeMessage.textContent = `Hello, ${userName}!`;
    } else {
        setupWelcomeMessage.textContent = `Hello there!`; 
    }

    // --- Function to display a specific step ---
    function showStep(stepIndex) {
        currentStep = Math.max(0, Math.min(stepIndex, sections.length - 1));

        sections.forEach((section, index) => {
            section.classList.toggle('active', index === currentStep);
        });

        
        backBtn.style.display = currentStep > 0 ? 'block' : 'none';

        if (currentStep === sections.length - 1) { 
            nextBtn.style.display = 'none';
            saveAndStartBtn.style.display = 'block';
            saveAndStartBtn.disabled = !agreeTermsCheckbox.checked; 
        } else {
            nextBtn.style.display = 'block';
            saveAndStartBtn.style.display = 'none';
        }

        if (currentStep === 0) { 
            document.getElementById('step2-developer').style.display = 'none';
            document.getElementById('step2-engineer').style.display = 'none';
        }

        sections[currentStep].querySelectorAll('.option-card').forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"], input[type="radio"]');
            card.removeEventListener('click', handleOptionCardClick);
            card.addEventListener('click', handleOptionCardClick);

            card.classList.toggle('selected', checkbox.checked);
        });

         if (currentStep === Array.from(sections).findIndex(s => s.id === 'step3')) {
            if (allSkills.length === 0) {
                fetchSkills();
            } else {
                renderSkills(allSkills); 
            }
        }
    }

    // Allow clicking/choosing of domains
    function handleOptionCardClick(event) {
        const card = this; 
        const checkbox = card.querySelector('input[type="checkbox"], input[type="radio"]');
        event.preventDefault(); 

        console.log("handleOptionCardClick triggered for:", card);
        console.log("  Initial checkbox checked state:", checkbox.checked);

        if (event.target === checkbox) {
            console.log("  Click originated directly on hidden checkbox. Returning.");
            return;
        }

        checkbox.checked = !checkbox.checked; 
        console.log("  NEW checkbox checked state (after toggle):", checkbox.checked);
        card.classList.toggle('selected', checkbox.checked); 
        console.log("  Card 'selected' class is now:", card.classList.contains('selected'));
    }

    // --- Unified and Corrected validateStep function ---
    function validateStep(stepIndex) {
        let isValid = true;
        const currentSection = sections[stepIndex];
        console.log("Validating step:", stepIndex, "Section ID:", currentSection.id);

        // Helper to get and update error messages
        const displayError = (elementId, message, condition) => {
            const errorElement = document.getElementById(elementId);
            if (condition) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                return true; // Indicates an error
            } else {
                errorElement.style.display = 'none';
                errorElement.textContent = '';
                return false; // Indicates no error
            }
        };

        // Clear all previous error messages before validation
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });

        if (currentSection.id === 'step1') {
            const selectedPaths = currentSection.querySelectorAll('input[name="careerPath"]:checked').length;
            console.log("VALIDATING Step 1:");
            console.log("  Number of selected career paths:", selectedPaths);
            if (displayError('careerPathErrorMessage', 'Please select at least one career path.', selectedPaths === 0)) {
                isValid = false;
            }
        } else if (currentSection.id === 'step2-developer') {
            if (currentSection.style.display !== 'none') {
                const selectedDevSpecs = currentSection.querySelectorAll('input[name="devSpecialization"]:checked').length;
                 console.log("VALIDATING Step 2 (Developer):");
                 console.log("  Number of selected developer specializations:", selectedDevSpecs);
                if (displayError('devSpecializationErrorMessage', 'Please select at least one developer specialization.', selectedDevSpecs === 0)) {
                    isValid = false;
                }
            }
        } else if (currentSection.id === 'step2-engineer') {
             // Only validate if this section is currently visible (i.e., engineer was chosen in step1)
            if (currentSection.style.display !== 'none') {
                const selectedEngSpecs = currentSection.querySelectorAll('input[name="engSpecialization"]:checked').length;
                if (displayError('engSpecializationErrorMessage', 'Please select at least one engineer specialization.', selectedEngSpecs === 0)) {
                    isValid = false;
                }
            }
        } else if (currentSection.id === 'step3') {
            // FIX: Changed querySelector to querySelectorAll
            const selectedSkills = currentSection.querySelectorAll('input[name="skills"]:checked').length;
            if (displayError('skillsErrorMessage', 'Please select at least one skill.', selectedSkills === 0)) {
                isValid = false;
            }
        } else if (currentSection.id === 'step4') {
            const employmentType = document.getElementById('employmentType').value;
            const age = document.getElementById('age').value;
            const contactNumber = document.getElementById('contactNumber').value;

            let fieldHasError = false;
            if (displayError('employmentTypeError', 'Please select your employment type.', !employmentType)) {
                fieldHasError = true;
            } 
            if (displayError('ageError', 'Please enter a valid age (13-100).', !age || age < 13 || age > 100)) {
                fieldHasError = true;
            } 
            if (displayError('contactNumberError', 'Please enter your contact number.', !contactNumber.trim())) {
                fieldHasError = true;
            }
            if (fieldHasError){
                isValid = false;
            }
            // Moved this console.log to the correct step4 block
            console.log("Step 4 validation result (isValid):", isValid);
        } else if (currentSection.id === 'step5') {
            if (displayError('termsError', 'You must agree to the Terms and Services to continue.', !agreeTermsCheckbox.checked)) {
                isValid = false;
            }
        }
        return isValid;
    }


    function nextStep() {
        if (!validateStep(currentStep)) {
            return; 
        }

        let newCurrentStep = currentStep + 1;

        if (currentStep === 0) { 
            const selectedCareerPaths = Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).map(cb => cb.value);
            const hasDeveloper = selectedCareerPaths.includes('Developer');
            const hasEngineer = selectedCareerPaths.includes('Engineer');

            const devSection = document.getElementById('step2-developer');
            const engSection = document.getElementById('step2-engineer');

            devSection.style.display = 'none';
            engSection.style.display = 'none';

            if (hasDeveloper || hasEngineer) {
                newCurrentStep = 1; 
                if (hasDeveloper) devSection.style.display = 'block';
                if (hasEngineer) engSection.style.display = 'block';
            } else {
                newCurrentStep = 3;
            }
        }
        else if (currentStep === 1) {
            const selectedCareerPaths = Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).map(cb => cb.value); // We are on step2-developer
            const hasEngineer = Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).includes(cb => cb.value === 'Engineer');
            const engSection = document.getElementById('step2-engineer');

            if (hasEngineer && engSection.style.display !== 'none') {
                // If engineer was selected and its section is displayed, go to step2-engineer
                newCurrentStep = 2;
            } else {
                // Otherwise, go directly to step3 (Skills)
                newCurrentStep = 3;
            }
        } 
        else if (currentStep === 2) { // We are on step2-engineer
             // Always go to step3 (Skills) from here
             newCurrentStep = 3;
        }

        if (newCurrentStep < sections.length) {
            showStep(newCurrentStep);
        } else {
            showStep(sections.length - 1);
        }
    }

    function prevStep() {
        let prevIdx = currentStep - 1;

        if (currentStep === 2) { 
            const selectedCareerPaths = Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).map(cb => cb.value);
            const hasDeveloperOrEngineer = selectedCareerPaths.includes('Developer') || selectedCareerPaths.includes('Engineer');

            if (!hasDeveloperOrEngineer) {
                prevIdx = 0; 
            } else {
                prevIdx = 1;
            }
        }
        
        if (prevIdx === 1) {
             const selectedCareerPaths = Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).map(cb => cb.value);
            const hasDeveloper = selectedCareerPaths.includes('Developer');
            const hasEngineer = selectedCareerPaths.includes('Engineer');

            const devSection = document.getElementById('step2-developer');
            const engSection = document.getElementById('step2-engineer');

            devSection.style.display = hasDeveloper ? 'block' : 'none';
            engSection.style.display = hasEngineer ? 'block' : 'none';
        }


        if (prevIdx >= 0) {
            showStep(prevIdx);
        } else {
            showStep(0); 
        }
    }

    // --- Event Listeners for Navigation Buttons ---
    nextBtn.addEventListener('click', nextStep);
    backBtn.addEventListener('click', prevStep);

    // --- Terms & Services checkbox enables/disables Save button ---
    agreeTermsCheckbox.addEventListener('change', () => {
        saveAndStartBtn.disabled = !agreeTermsCheckbox.checked;
        console.log("Checkbox changed. Checked:", agreeTermsCheckbox.checked);
        // Optionally re-validate step 5 immediately to show/hide error
        validateStep(sections.length - 1);
    });

    // --- Experience ---
    document.getElementById('addExperienceBtn').addEventListener('click', function() {
        const container = document.getElementById('experienceContainer');
        const newItem = document.createElement('div');
        newItem.classList.add('dynamic-field-item');
        newItem.innerHTML = `
            <button type="button" class="remove-btn"><i class="fas fa-times-circle"></i></button>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" name="expCompany[]" placeholder="e.g., Google" required>
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="expStartDate[]" required>
            </div>
            <div class="form-group">
                <label>End Date (or present)</label>
                <input type="date" name="expEndDate[]">
            </div>
            <div class="form-group">
                <label>Description (Optional)</label>
                <textarea name="expDescription[]" rows="3" placeholder="Briefly describe your role and responsibilities."></textarea>
            </div>
        `;
        container.appendChild(newItem);
        newItem.querySelector('.remove-btn').addEventListener('click', function() {
            newItem.remove();
        });
    });

    // --- Certifications ---
    document.getElementById('addCertificationBtn').addEventListener('click', function() {
        const container = document.getElementById('certificationsContainer');
        const newItem = document.createElement('div');
        newItem.classList.add('dynamic-field-item');
        newItem.innerHTML = `
            <button type="button" class="remove-btn"><i class="fas fa-times-circle"></i></button>
            <div class="form-group">
                <label>Course/Certification Name</label>
                <input type="text" name="certName[]" placeholder="e.g., AWS Certified Developer" required>
            </div>
            <div class="form-group">
                <label>Issue Date</label>
                <input type="date" name="certIssueDate[]" required>
            </div>
            <div class="form-group">
                <label>Expiration Date (Optional)</label>
                <input type="date" name="certExpirationDate[]">
            </div>
        `;
        container.appendChild(newItem);
        newItem.querySelector('.remove-btn').addEventListener('click', function() {
            newItem.remove();
        });
    });

    // --- Skills Loading and Filtering (with Backend API) ---
    const skillsContainer = document.getElementById('skillsContainer');
    const skillSearchInput = document.getElementById('skillSearch');
    let allSkills = []; 

    async function fetchSkills() {
        skillsContainer.innerHTML = '<p class="text-muted">Fetching skills...</p>';
        try {
            const response = await new Promise(resolve => setTimeout(() => {
                resolve({
                    json: () => Promise.resolve([
                        "JavaScript", "Python", "Java", "C++", "C#", "Go", "Ruby", "PHP",
                        "HTML", "CSS", "SQL", "NoSQL", "React", "Angular", "Vue.js", "Node.js",
                        "Django", "Flask", "Spring Boot", "Laravel", "Docker", "Kubernetes",
                        "AWS", "Azure", "Google Cloud", "Agile", "Scrum", "Git", "DevOps",
                        "Machine Learning", "Data Analysis", "Cybersecurity", "Network Security",
                        "UI/UX Design", "Figma", "Sketch", "Photoshop", "Illustrator",
                        "Project Management", "Jira", "Confluence", "SQL Server", "MySQL",
                        "PostgreSQL", "MongoDB", "Redis", "TensorFlow", "PyTorch", "Tableau",
                        "Power BI", "Excel", "Salesforce", "API Development", "Microservices",
                        "RESTful APIs", "GraphQL", "Cyber Threat Intelligence", "Penetration Testing",
                        "Ethical Hacking", "Incident Response", "Firewall Management", "VPN",
                        "Cloud Security", "Data Privacy", "GDPR", "HIPAA", "Financial Modeling",
                        "Budgeting", "Risk Management", "Business Analysis", "Requirements Gathering",
                        "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Adaptability",
                        "Time Management", "Leadership", "Creativity", "Attention to Detail", "Negotiation",
                        "Public Speaking", "Writing", "Research", "Customer Service", "Sales", "Marketing",
                        "Data Entry", "Bookkeeping", "Blockchain", "Quantum Computing", "AR/VR", "IoT"
                    ])
                });
            }, 800)); 

            allSkills = await response.json();
            renderSkills(allSkills);
        } catch (error) {
            console.error('Error fetching skills:', error);
            skillsContainer.innerHTML = '<p class="text-danger">Failed to load skills. Please check your network or server.</p>';
        }
    }

    // Rendering skills based on a filtered list
    function renderSkills(skillsToRender) {
        skillsContainer.innerHTML = ''; 
        if (skillsToRender.length === 0) {
            skillsContainer.innerHTML = '<p class="text-muted">No skills found matching your search.</p>';
            return;
        }
        skillsToRender.forEach(skill => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" name="skills" value="${skill}">
                <span>${skill}</span>
            `;
            skillsContainer.appendChild(label);
            label.addEventListener('click', handleOptionCardClick);
        });
    }

    // search input changes to filter skills
    skillSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredSkills = allSkills.filter(skill =>
            skill.toLowerCase().includes(searchTerm)
        );
        renderSkills(filteredSkills);
    });

    // --- Final Form Submission ---
    profileSetupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log("Form submitted");

        if (!validateStep(currentStep)) { 
            console.warn("Validation failed at step", currentStep);
            return;
        }

  const userId = localStorage.getItem('userId'); 
  console.log('User ID from localStorage:', userId);
        if (!userId || userId === 'undefined') {
            alert('User not authenticated. Redirecting to login...');
            window.location.href = 'index.html';
            console.log("User ID for submission:", userId);
            return;
        }
        console.log('User ID:', userId);
        alert("✅ Reached profile submission code.");

         const data = {
    userId: userId,
    careerPaths: Array.from(document.querySelectorAll('input[name="careerPath"]:checked')).map(cb => cb.value),
    devSpecializations: Array.from(document.querySelectorAll('input[name="devSpecialization"]:checked')).map(cb => cb.value),
    engSpecializations: Array.from(document.querySelectorAll('input[name="engSpecialization"]:checked')).map(cb => cb.value),
    skills: Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(cb => cb.value),
    employmentType: document.getElementById('employmentType').value,
    age: parseInt(document.getElementById('age').value),
    contactNumber: document.getElementById('contactNumber').value,
    languages: document.getElementById('languages').value.split(',').map(lang => lang.trim()).filter(lang => lang),
    hobbies: document.getElementById('hobbies').value.split(',').map(hobby => hobby.trim()).filter(hobby => hobby),
    experience: [], 
    certifications: [] 
  };

  if (data.careerPaths.length === 0) {
    alert('Select at least one career path!');
    return;
  }
  if (!data.employmentType) {
    alert('Select your employment type!');
    return;
  }
  if (!data.age || data.age < 13 || data.age > 100) {
    alert('Enter a valid age (13-100)!');
    return;
  }

        // dynamic experience fields
        data.experience = [...document.querySelectorAll('#experienceContainer .dynamic-field-item')].map(item => ({
            company: item.querySelector('input[name="expCompany[]"]').value,
            startDate: item.querySelector('input[name="expStartDate[]"]').value,
            endDate: item.querySelector('input[name="expEndDate[]"]').value,
            description: item.querySelector('textarea[name="expDescription[]"]').value
        }));

        // Handle dynamic certification fields
        data.certifications = [...document.querySelectorAll('#certificationsContainer .dynamic-field-item')].map(item => ({
            name: item.querySelector('input[name="certName[]"]').value,
            issueDate: item.querySelector('input[name="certIssueDate[]"]').value,
            expirationDate: item.querySelector('input[name="certExpirationDate[]"]').value
        }));

        try {
            console.log('Submitting data:', data);
            const response = await fetch('http://localhost:3000/api/setup-profile', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Profile setup failed');
            }
            alert('Profile saved successfully!');
            localStorage.setItem('profileSetupComplete', 'true');
            window.location.href = 'Dashboard-User.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ${error.message}');
        }
    });


document.getElementById('employmentType').addEventListener('change', function() {
    if (currentStep === Array.from(sections).findIndex(s => s.id === 'step4')) {
        validateStep(currentStep);
    }
});
document.getElementById('age').addEventListener('input', function() {
    if (currentStep === Array.from(sections).findIndex(s => s.id === 'step4')) {
        validateStep(currentStep);
    }
});
document.getElementById('contactNumber').addEventListener('input', function() {
    if (currentStep === Array.from(sections).findIndex(s => s.id === 'step4')) {
        validateStep(currentStep);
    }
});
    // --- Initialize the first step ---
    showStep(currentStep);
    // Initial fetch of skills when page loads
    fetchSkills();
});