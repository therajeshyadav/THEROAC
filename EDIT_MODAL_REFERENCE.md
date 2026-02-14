# EDIT MODAL COMPLETE REFERENCE DOCUMENTATION

## OVERVIEW
This document contains the complete structure and fields for the Edit Modal used for Jobs, Internships, and Opportunities (Events) based on Unstop platform reference.

---

## SIDEBAR NAVIGATION STRUCTURE

### FOR JOB & INTERNSHIP:
1. **Internships Details** / **Job Details**
2. **Eligibility**
3. **Application Settings**
4. **Hiring Rounds**
5. **Additional Info**
6. **Banner / Theme**

### FOR OPPORTUNITY (EVENTS):
1. **Basic details**
2. **Eligibility**
3. **Registration Settings** (same as Application Settings)
4. **Rounds & Stages** (same as Hiring Rounds) - Shows "Action Needed" badge if incomplete
5. **Prizes**
6. **Payment**
7. **Additional Info**
8. **Banner / Theme**

---

## SECTION 1: INTERNSHIPS/JOB DETAILS (Basic Details for Opportunity)

### 1.1 About the Internship/Job
**Fields:**
- **Internship/Job Title** *
  - Input: Text
  - Max: 190 characters
  - Placeholder: e.g., "Front End Developer"

- **Company**
  - Input: Text (auto-filled from organization)
  - Logo display with "Update Logo" link
  - Example: "Sipna College Of Engineering and Technology Amravati"

- **Internship/Job Category** *
  - Input: Multi-select tags (removable)
  - Dropdown: "Select internship/job category"
  - Example tags: "Backend Development"

### 1.2 Select Applicable Work Arrangements
**Options (Radio/Toggle buttons):**
- Full-Time
- Part-Time
- Contractual

### 1.3 Internship Duration / Job Duration
**Fields:**
- **Duration Type**: Dropdown (Months, Years, Weeks)
- **Duration Value**: Number input with up/down arrows
- Example: "3 Months"

### 1.4 Working Days
**Options (Chip selection):**
- 4 Days
- 5 Days (default selected)
- 6 Days
- Alternate Saturdays Off

### 1.5 Job Schedule
**Options (Multiple selection chips):**
- Day shift
- Morning shift
- Evening shift
- Night shift
- Flexible Work Hours
- Rotational shift
- Fixed shift
- UK shift
- US shift
- Monday to Friday
- Weekend Availability
- Weekend only

### 1.6 No. of Openings *
**Fields:**
- Number input with up/down arrows
- Checkbox: "Hide No. of openings from candidates"

### 1.7 Link Festival/Campaign
**Fields:**
- Text input: "Enter Festival/campaign name"
- Optional field

### 1.8 Company Website URL
**Fields:**
- URL input: "https:// Company Website URL"
- Optional field

### 1.9 Work Location
**Select work setup for this role (Radio buttons with icons):**
- In Office
- Remote
- Hybrid
- Field job

**Enter Work Location:**
- Dropdown: City/State/Country selector
- Search input: "Search by city, state, country"
- Link: "Current location" (auto-detect)

### 1.10 About the Role and Skills
**Internship/Job Description** *
- Rich text editor with toolbar:
  - Bold, Italic, Underline, Strikethrough
  - Alignment options (Left, Center, Right, Justify)
  - Bullet list, Numbered list
  - Subscript, Superscript
  - Insert link, Insert image
- Button: "Generate with AI" (top right)
- Placeholder: "Include role expectations, required skills and key responsibilities"

**Content sections (in description):**
- Experience
- Responsibility
- Requirements

### 1.11 Skills Required
**Fields:**
- Tag input with removable chips
- Max: 10 skills
- Helper text: "Add up to 10 skills. We'll use these to show candidates at a glance what you're looking for"
- Example tags: MySQL, Spring Boot, Agile Methodologies (Scrum), API Development (REST), Java

### 1.12 Salary & Benefits (for Internship: Stipend & Benefits)
**How is the pay structured?** (Radio buttons)
- Fixed
- Range (default)
- Fixed + Variable
- Unpaid

**Enter stipend/salary range:**
- Period dropdown: Monthly, Yearly, Weekly, Hourly
- Currency dropdown: INR (₹), USD ($), EUR (€), GBP (£)
- Min amount: Number input
- Max amount: Number input
- Example: "Monthly | INR (₹) | Min: 2,000 | Max: 7,000"

**Benefits/Perks** (Multiple selection chips with icons):
- Job Offer
- Certificate of Completion
- Letter of Recommendation
- Medical Insurance
- Transport
- Food & Beverages
- In-Office Gym/Yoga Studio
- Learning Allowance
- Office Library
- Flexible Hours
- Hybrid Working
- Recreation Passes
- Snacks Facilities
- 5 Day Placement Offer
- Other

---

## SECTION 2: ELIGIBILITY

### 2.1 Who Can Apply?
**Select candidate type(s) who are eligible to apply for this role:**

**Options (Chip buttons):**
- Everyone can apply (default selected)
- College Students
- Freshers
- Professionals

### 2.2 College/Organization
**Default:** Everyone can apply
- Text: "Restrict applicants based on their College/Organization"
- Action: "Change" link (opens restriction modal)

### 2.3 Gender
**Default:** Everyone can apply
- Text: "Restrict applicants based on their Gender"
- Action: "Change" link (opens restriction modal)

---

## SECTION 3: APPLICATION SETTINGS (Registration Settings for Opportunity)

### 3.1 Application Configuration
**Platform:**
- Text: "This internship is set to receive applications on Unstop"
- Action: "Change" link
- Platform options: Unstop (default) | Other platform

**Registration Timeline:**
- Start date & time: "12 Feb 26, 12:00 AM"
- End date & time: "12 Feb 26, 8:38 AM"
- Action: "Change" link

**Maximum Application Limit:**
- Button: "No limit ∞" (toggleable)
- Can set specific number limit

**Status:**
- Text: "Set the application status OPEN to accept applications & CLOSE to restrict new ones"
- Toggle badge: "Closed" (red) | "Open" (green)

### 3.2 Application Form
**Customize the form applicants fill out when applying for this role**

**Default Fields (with icons and Required status):**
1. Name - Required (locked)
2. Email - Required (locked)
3. Mobile number - Required (dropdown to change)
4. CV/Resume - Required (dropdown to change)
5. Gender - Required (dropdown to change)
6. Current College/Organization - Required (dropdown to change)
7. User Type - Required (dropdown to change)
8. Applicant's location - Required (dropdown to change)
9. Differently abled - Required (dropdown to change)

### 3.3 Screening Questions/Additional Info
**Section header:**
- "Add custom questions in application form and use response to shortlist applicants"
- Button: "+" (add custom question)

**Suggested screening question(s)** (Expandable section):
**Chips with "+" icon:**
- Cover Letter
- Expected Salary
- Highest Qualification
- Preferred Work Location
- Joining Timeline
- Notice Period
- Portfolio/Work Samples
- Willingness to Relocate

---

## SECTION 4: HIRING ROUNDS (Rounds & Stages for Opportunity)

### 4.1 Rounds Page (Empty State)
**Description:**
"Create rounds to represent each stage of the opportunity. Add rounds in sequence to define the flow and ensure every step of the process is captured clearly."

**Empty state:**
- Icon: 🎯
- Text: "No round added yet"
- Subtext: "Please click on the 'Add Round' button to create a round"
- Button: "+ Add round" (blue)

### 4.2 Select a Round Modal
**Modal title:** "Select a Round"
**Description:** "Specify the rounds like Quiz or Hackathon to represent the flow of opportunity"

**Round Types (Cards with icons):**

1. **Assessment** (Purple document icon)
   - "Create MCQs or subjective assessments with customizations, and next-gen proctoring"

2. **Code Contest** (Green code icon)
   - "Create code contest with inbuilt code writer & compiler for 15+ coding languages"

3. **Submission through Unstop** (Orange upload icon)
   - "Accept submissions like PPT, articles, pictures, etc. You can also attach a case file"

4. **Session on Youtube & Vimeo** (Red video icon)
   - "For sessions to be hosted on YouTube & Vimeo platform"

5. **Interview** (Pink chat icon)
   - "For interviews to be hosted either offline or virtually on Unstop"

6. **Other** (Additional option)

### 4.3 Round Configuration Modals

#### ASSESSMENT MODAL:
**Fields:**
- **Select round conduct platform:**
  - Option 1: Unstop (with Unstop icon) - Selected by default
  - Option 2: Other platform (with globe icon) - Dashed border

- **Round name** *
  - Input: Text
  - Pre-filled: "Assessment"

- **Round Description** *
  - Input: Textarea
  - Placeholder: "General assessment round."

- **Round dates** *
  - **Live:** Date-time picker with calendar icon
    - Format: "13/02/26 19:40:00"
  - **Close:** Date-time picker with calendar icon
    - Format: "27/02/26 19:40:00"
  - Visual: Timeline connector between Live and Close
  - Info text: "This round will be Live from February 13 to February 27, 2026 for 14 Days"

- **Warning banner (yellow background):**
  - Icon: ⓘ
  - Text: "You can add problem statements/questions in this round later in the edit panel"

- **Action button:** "Save" (blue, bottom right)

#### CODE CONTEST MODAL:
**Same structure as Assessment with:**
- Pre-filled Round name: "Code Contest"
- Pre-filled Description: "Participate in coding contests hosted on Unstop."

#### SUBMISSION THROUGH UNSTOP MODAL:
**Same structure as Assessment with:**
- Pre-filled Round name: "Submission through Unstop"
- Pre-filled Description: "Submission round through Unstop platform."

#### SESSION ON YOUTUBE & VIMEO MODAL:
**Same structure as Assessment**

#### INTERVIEW MODAL:
**Same structure as Assessment**

---

## SECTION 5: PRIZES (Only for Opportunity)

### 5.1 Participation Certificate
**Question:** "Participation certificate will be provided?"
**Description:** "You can generate and send participation/winning certificates through the Unstop platform itself once the particular round/opportunity is over"

**Options (Radio buttons):**
- Yes
- No (default selected)

### 5.2 Add Prizes
**Section header:** "Add Prizes"
**Description:** "Create prizes and seamlessly send participation or winning certificates via Unstop after your opportunity ends."

**Warning banner (yellow background):**
- Icon: ⓘ
- Text: "Enter the confirmed prize amount. Once the event is live, the prize money cannot be reduced"

**Empty state:**
- Icon: 🏆
- Text: "No Prize listed"
- Subtext: "You have not set up any prizes."
- Button: "+ Add prize"

---

## SECTION 6: PAYMENT (Only for Opportunity)

### 6.1 Registration Fee
**Question:** "Does this opportunity have a registration fee?"

**Options (Radio buttons):**
- Yes (default selected)
- No

### 6.2 Choose Payment Platform
**Options (Radio buttons):**
- Unstop (default selected)
- Other payment portal

### 6.3 Payment Ticket
**Section header:** "Payment ticket"
**Description:** "Set application fees with customizable ticket pricing and coupon codes."

**Empty state:**
- Icon: 🎫
- Text: "No Tickets created"
- Subtext: "No tickets are currently set up for this opportunity."
- Button: "+ Add ticket"

#### CREATE A TICKET MODAL:
**Fields:**
- **Ticket title**
  - Input: Text
  - Pre-filled: "Ticket 1"

- **Add ticket description (if any)**
  - Expandable section with "+" icon
  - Input: Textarea (when expanded)

- **Ticket Fee/ Amount (in INR)** *
  - Input: Number with currency symbol (₹)
  - Placeholder: "00"

- **Fee type**
  - Dropdown with info icon
  - Options: Team Fee, Individual Fee, etc.
  - Default: "Team Fee"

- **Ticket purchase requirement**
  - Dropdown
  - Options: Required, Optional
  - Default: "Required"

- **Do you want to send invoice to team**
  - Dropdown
  - Options: Yes, No
  - Default: "No"

- **Action button:** "Add Ticket" (gray, bottom right)

### 6.4 Account Details / Payout Form
**Section header:** "Account details / Payout form"
**Description:** "Enter your bank account details to facilitate timely payment transfers after registration closes."

**Info banner (blue background):**
- Icon: ⓘ
- Text: "We advise you add Payout details to receive payments on time!"

**Fields (all showing "--" as placeholder):**
- Account holder:
- Phone No:
- Email:
- Bank account:
- Confirm bank account:
- IFSC code:
- PAN number:
- GSTIN:
- Address 1:
- Address 2:
- City:
- State:
- Pincode:

**Edit icon:** Pencil icon (top right of section)

### 6.5 Get Service Charge From
**Description:** "Specify if the processing fee/tax will be added to the participant's payment or deducted from the organizer's payout"

**Options (Two cards with radio buttons):**

**Card 1: Player** (Selected)
- Example breakdown:
  - If registration amount: ₹100
  - Tax: 2%+ (18% GST of 2%)
  - User pay: ₹102.36
  - You get: ₹100

**Card 2: Organiser**
- Example breakdown:
  - If registration amount: ₹100
  - Tax: 2.31(2% + (18% GST of 2%))
  - User pay: ₹100
  - You get: ₹97.69

### 6.6 Payment Methods
**Section header:** "Payment methods"
**Description:** "Enable at least one payout method to ensure seamless transfer of funds"

**Options (Toggle switches - all enabled by default):**
1. **UPI (Google Pay, BHIM, PhonePe, etc.)**
   - Service charge: 2%
   - Icon: UPI logo

2. **Internet banking (All major banks)**
   - Service charge: 3%
   - Icon: Bank building

3. **Indian Credit/ Debit card (Visa, Mastercard, RuPay, Maestro)**
   - Service charge: 3%
   - Icon: Card

4. **International Credit/ Debit card**
   - Service charge: 5%
   - Icon: Card with globe

5. **Wallet (Mobikwik, Freecharge, etc.)**
   - Service charge: 3%
   - Icon: Wallet

---

## SECTION 7: ADDITIONAL INFO
**SAME FOR ALL TYPES (Job, Internship, Opportunity)**

### Fields:
- Contact Email
- Contact Phone
- Website URL
- LinkedIn URL
- Twitter/X URL
- Facebook URL
- Discord Server (for Opportunity only)
- Slack Workspace (for Opportunity only)
- Sponsors (for Opportunity only) - Textarea, one per line
- Partners (for Opportunity only) - Textarea, one per line
- FAQs - Textarea, format: "Q: Question? A: Answer"
- Terms & Conditions - Textarea
- Additional Notes - Textarea
- Checkbox: Mark as Featured
- Checkbox: Send notifications to applicants about updates

---

## SECTION 8: BANNER / THEME
**SAME FOR ALL TYPES (Job, Internship, Opportunity)**

### Fields:
- Banner Image * - File upload (1920x600px recommended)
- Event/Company Logo - File upload (400x400px recommended)
- Primary Theme Color - Color picker + hex input
- Secondary Theme Color - Color picker + hex input
- Promotional Video URL - URL input (YouTube, Vimeo)
- Gallery Images - Textarea (URLs, one per line)

---

## KEY DIFFERENCES SUMMARY

### JOB & INTERNSHIP:
- 6 sidebar sections
- Focus on work details, salary/stipend
- Application Settings
- Hiring Rounds
- No Prizes section
- No Payment section

### OPPORTUNITY (EVENTS):
- 8 sidebar sections
- Focus on event details, registration
- Registration Settings (same as Application Settings)
- Rounds & Stages (same as Hiring Rounds)
- Has Prizes section
- Has Payment section with tickets and payout

### COMMON SECTIONS (Same for all):
- Basic Details / Internships Details / Job Details
- Eligibility
- Application/Registration Settings
- Hiring Rounds / Rounds & Stages
- Additional Info
- Banner / Theme

---

## DESIGN PATTERNS OBSERVED

### UI Elements:
- Clean white background
- Blue primary buttons (#0066FF)
- Chip/tag based selections
- Icon-based options
- Radio buttons with card layouts
- Toggle switches for enable/disable
- Collapsible/expandable sections
- Empty states with icons and CTAs
- Warning/info banners (yellow/blue backgrounds)
- Modal overlays for complex forms
- Date-time pickers with calendar icons
- Rich text editors with toolbars
- Dropdown selectors
- Number inputs with up/down arrows
- File upload areas
- Color pickers

### Interaction Patterns:
- "Change" links for editing inline
- "+" buttons for adding items
- "Save" button (blue, bottom right)
- "Close" button (bottom left)
- Edit icons (pencil) for sections
- Remove icons (X) for tags/chips
- Expandable sections with "+" icon
- Timeline connectors for date ranges
- Lock icons for required/fixed fields
- Info icons (ⓘ) for helper text

---

## VALIDATION & REQUIRED FIELDS

### Required Fields (marked with *):
- Title
- Company
- Category
- Duration
- No. of openings
- Work location
- Description
- Round name (in round modals)
- Round description (in round modals)
- Round dates (in round modals)
- Ticket fee (in ticket modal)

### Optional Fields:
- Link Festival/Campaign
- Company Website URL
- Skills (but recommended)
- Benefits/Perks
- Screening questions
- Additional info fields
- Social media links
- Gallery images

---

## NOTES FOR IMPLEMENTATION

1. **Dynamic Content:** Show/hide sections based on type (Job/Internship/Opportunity)
2. **Terminology:** Use correct terms per type (Application vs Registration, Hiring Rounds vs Rounds & Stages)
3. **Validation:** Implement real-time validation with error messages
4. **Auto-save:** Consider draft saving functionality
5. **Rich Text:** Implement proper rich text editor with AI generation
6. **Date Handling:** Use proper date-time pickers with timezone support
7. **File Upload:** Handle image uploads with preview and size validation
8. **Multi-select:** Implement tag/chip inputs with max limits
9. **Modals:** Create reusable modal components for rounds, tickets, prizes
10. **Responsive:** Ensure mobile-friendly design
11. **Accessibility:** Add proper ARIA labels and keyboard navigation
12. **State Management:** Track form state, changes, and validation errors
13. **API Integration:** Map fields to backend API structure
14. **Conditional Logic:** Show/hide fields based on selections (e.g., paid vs free)

---

END OF REFERENCE DOCUMENTATION
