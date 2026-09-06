import { DayAssignment, DayChallenge, Learner, AppNotification, ChatMessage } from '../types';

export const INITIAL_ASSIGNMENTS: DayAssignment[] = [
  {
    id: 'asg-1',
    day: 1,
    title: 'Verbal Foundations & Grammar Mastery',
    subtitle: 'Conquer Sentence Dynamics, Common Errors & Placement Traps',
    description: 'Master the high-frequency verbal patterns tested by top tech and consulting placement drives (TCS, Infosys, Accenture, Deloitte, Amazon).',
    published: true,
    scheduledDate: 'Day 1 - 09:00 AM',
    content: {
      overview: 'Welcome to Day 1 of VerbalEdge. Today we deconstruct sentence mechanics: subject-verb agreement, dangling modifiers, parallel structure, and corporate vocabulary nuances.',
      keyTakeaways: [
        'Identify subtle Subject-Verb mismatches involving compound clauses and intervening prepositional phrases.',
        'Eliminate dangling modifiers in technical reports and business summaries.',
        'Master the 25 most repeated verbal aptitude root words and contextual synonyms.',
        'Improve typing speed and verbal fluency for online proctored placement exams.'
      ],
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      pdfTitle: 'VerbalEdge_Day1_Placement_Grammar_Cheatsheet.pdf',
      readingMaterial: `### Placement Rule 1: The "As well as / Along with" Trap
When a singular subject is joined to other nouns by "as well as", "together with", or "in addition to", the verb remains SINGULAR.
*Incorrect:* The team lead as well as the developers are attending the client demo.
*Correct:* The team lead as well as the developers is attending the client demo.

### Placement Rule 2: Either/Or & Neither/Nor Proximity
The verb agrees in person and number with the noun CLOSER to it.
*Correct:* Neither the manager nor the engineers were aware of the production outage.
*Correct:* Neither the engineers nor the manager was aware of the production outage.

### Placement Rule 3: Parallelism in Resumes & Communication
When listing qualifications or achievements, maintain consistent grammatical form:
*Avoid:* Responsible for designing APIs, database optimization, and to lead scrums.
*Better:* Responsible for designing APIs, optimizing databases, and leading scrums.`,
      resourceLinks: [
        { title: 'Top 50 Verbal Aptitude Questions (PDF Guide)', url: '#', type: 'doc' },
        { title: 'Sentence Correction Video Breakdown (15 Mins)', url: '#', type: 'video' },
        { title: 'Grammar Traps Interactive Drill', url: '#', type: 'practice' },
      ],
    },
  },
  {
    id: 'asg-2',
    day: 2,
    title: 'Corporate Communication & Business Etiquette',
    subtitle: 'Email Frameworks, Assertive Articulation & Executive Presence',
    description: 'Transition from campus to boardroom communication. Learn how to draft crisp, persuasive emails, handle disagreements tactfully, and command authority.',
    published: true,
    scheduledDate: 'Day 2 - 09:00 AM',
    content: {
      overview: 'Clear communication gets you hired; executive articulation gets you promoted. Day 2 focuses on high-impact professional correspondence, tone modulation, and clarity.',
      keyTakeaways: [
        'The BLUF Framework (Bottom Line Up Front) for executive emails and status updates.',
        'Eliminating passive-aggressive phrasing ("As per my previous email", "Per our discussion").',
        'Structuring 60-second elevator pitches that capture interviewer attention.',
        'Active listening cues and diplomatic objection handling during group discussions.'
      ],
      pdfTitle: 'VerbalEdge_Day2_Executive_Communication_Toolkit.pdf',
      readingMaterial: `### The BLUF (Bottom Line Up Front) Email Structure
1. **Subject Line:** [Action Required] Project Alpha: Architecture Review by 5 PM IST
2. **First Sentence (The BLUF):** We need approvals on the database migration plan by Friday 5 PM to stay on schedule.
3. **Context (Max 3 bullet points):** The staging environment passed all stress tests; latency decreased by 40%; roll-back script is verified.
4. **Next Steps & Ownership:** Kapil will deploy to pre-prod once approvals are logged.

### De-Escalation & Tone Modulation
- Instead of "You misunderstood what I said" -> "Allow me to clarify my perspective on this point."
- Instead of "That is not feasible" -> "To achieve that target safely, we would require two additional sprints."`,
      resourceLinks: [
        { title: 'Email Templates for Offer Negotiation & Leave Requests', url: '#', type: 'doc' },
        { title: 'Executive Presence & Micro-Expressions Workshop', url: '#', type: 'video' },
        { title: 'Tone Rectification Practice Matrix', url: '#', type: 'practice' },
      ],
    },
  },
  {
    id: 'asg-3',
    day: 3,
    title: 'Placement Interview Mastery & Speaking Crucible',
    subtitle: 'STAR Method, Spontaneous Speaking & HR Masterclass',
    description: 'The final crucible: Master behavioral interviews, answer tricky HR curveballs, record your pitch, and claim your Grand Completion Certificate.',
    published: true,
    scheduledDate: 'Day 3 - 09:00 AM',
    content: {
      overview: 'Day 3 prepares you for the ultimate hurdle: the placement interview room. Master spontaneous thinking, eliminate vocal fillers (um, like, basically), and ace the STAR framework.',
      keyTakeaways: [
        'The STAR method (Situation, Task, Action, Result) with quantified business impact metrics.',
        'Mastering the 90-second "Tell Me About Yourself" pitch tailored to tech & product roles.',
        'Overcoming impromptu speaking anxiety and pauses using the PREP framework.',
        'Audio recording challenge: evaluate pacing, tone, and confidence.'
      ],
      pdfTitle: 'VerbalEdge_Day3_Master_Interview_Playbook.pdf',
      readingMaterial: `### The STAR Framework Perfected
- **Situation:** Set the stakes concisely in 15 seconds.
- **Task:** Clarify your exact responsibility (not just the whole team's goal).
- **Action:** Highlight 2-3 specific technical and strategic decisions you initiated.
- **Result:** Always quantify the outcome. ("Reduced API response time by 32% and onboarded 1,200 active users").

### Handling the "Greatest Weakness" Curveball
Never give fake weaknesses ("I work too hard" or "I am too perfectionist").
Give a genuine skill you recognized as an area of growth, the concrete steps you are actively taking to master it, and measurable progress made.`,
      resourceLinks: [
        { title: 'Top 100 HR & Managerial Interview Questions with Sample Answers', url: '#', type: 'doc' },
        { title: 'Mock Interview Simulator & Pitch Analysis', url: '#', type: 'practice' },
      ],
    },
  },
];

export const INITIAL_CHALLENGES: DayChallenge[] = [
  {
    id: 'ch-1',
    day: 1,
    title: 'Day 1 Verbal Sprint: Grammar & Speed Challenge',
    timeLimitMinutes: 10,
    passingScore: 75,
    questions: [
      {
        id: 'q1-1',
        type: 'mcq',
        question: 'Identify the sentence with the correct Subject-Verb Agreement:',
        options: [
          'The Director, along with all the senior architects, are attending the conference.',
          'The Director, along with all the senior architects, is attending the conference.',
          'The Director, along with all the senior architects, were attending the conference.',
          'The Director, along with all the senior architects, have attended the conference.',
        ],
        correctAnswer: 'The Director, along with all the senior architects, is attending the conference.',
        explanation: 'When parenthetical phrases like "along with" are used, the verb agrees with the primary subject ("The Director", singular).',
        ruleReference: 'Subject-Verb Concord: Parenthetical phrases joined by "along with", "as well as", "together with", or "in addition to" do not compound the subject. The verb agrees solely with the initial head noun.',
        optionExplanations: {
          'The Director, along with all the senior architects, are attending the conference.': '❌ Incorrect. "Are" is plural. Phrases introduced by "along with" do not make the subject plural; the subject remains the singular "The Director".',
          'The Director, along with all the senior architects, is attending the conference.': '✅ Correct! The grammatical head subject is "The Director" (singular). The intervening phrase does not affect the verb number.',
          'The Director, along with all the senior architects, were attending the conference.': '❌ Incorrect. "Were" is plural past tense, which disagrees with the singular subject "The Director".',
          'The Director, along with all the senior architects, have attended the conference.': '❌ Incorrect. "Have" is plural, creating a subject-verb agreement violation with the singular head noun.',
        },
      },
      {
        id: 'q1-2',
        type: 'vocabulary',
        question: 'Select the synonym for "PRAGMATIC" in corporate problem-solving:',
        options: ['Idealistic', 'Theoretical', 'Practical and outcome-oriented', 'Hesitant'],
        correctAnswer: 'Practical and outcome-oriented',
        explanation: 'Pragmatic means dealing with problems in a realistic, practical way rather than relying on abstract theories.',
        ruleReference: 'Placement Aptitude Vocabulary: Frequently tested in tech verbal tests (TCS, Infosys, Accenture) to gauge candidates\' readiness for agile, practical decision-making.',
        optionExplanations: {
          'Idealistic': '❌ Incorrect. "Idealistic" means guided by noble ideals rather than practical considerations—an antonym of pragmatic.',
          'Theoretical': '❌ Incorrect. "Theoretical" relates to abstract hypotheses rather than hands-on execution.',
          'Practical and outcome-oriented': '✅ Correct! Pragmatism in software engineering and business means focusing on feasible, empirical outcomes that work in production.',
          'Hesitant': '❌ Incorrect. "Hesitant" means indecisive or reluctant, unrelated to pragmatic problem-solving.',
        },
      },
      {
        id: 'q1-3',
        type: 'sentence_correction',
        question: 'Spot and fix the error: "Having finished the sprint early, the deployment was initiated by Kapil."',
        instructions: 'What is the grammatical defect in this sentence?',
        options: [
          'No error',
          'Dangling modifier: The modifier "Having finished the sprint early" incorrectly modifies "the deployment" instead of Kapil.',
          'Incorrect tense of "initiated"',
          'Prepositional error with "by"',
        ],
        correctAnswer: 'Dangling modifier: The modifier "Having finished the sprint early" incorrectly modifies "the deployment" instead of Kapil.',
        explanation: 'Deployments cannot finish sprints; Kapil finished it. Correct: "Having finished the sprint early, Kapil initiated the deployment."',
        ruleReference: 'Syntax Rules: An introductory participial phrase must be immediately followed by the noun it logically modifies. Otherwise, it creates a dangling modifier defect.',
        optionExplanations: {
          'No error': '❌ Incorrect. The sentence contains a classic dangling participle error.',
          'Dangling modifier: The modifier "Having finished the sprint early" incorrectly modifies "the deployment" instead of Kapil.': '✅ Correct! As written, the participle phrase "Having finished the sprint early" illogically attaches to "the deployment". Deployments cannot finish sprints.',
          'Incorrect tense of "initiated"': '❌ Incorrect. "Initiated" is the proper simple past verb tense.',
          'Prepositional error with "by"': '❌ Incorrect. The passive preposition "by" is syntactically fine, but the modifier attachment is flawed.',
        },
      },
      {
        id: 'q1-4',
        type: 'mcq',
        question: 'Choose the word that correctly fills the blank: "The candidate\'s explanation was so _____ that even the non-technical panel understood the core algorithm immediately."',
        options: ['Lucid', 'Obscure', 'Ambivalent', 'Convoluted'],
        correctAnswer: 'Lucid',
        explanation: 'Lucid means clear, easy to understand, and articulate.',
        ruleReference: 'Verbal Reasoning: The context clue "even the non-technical panel understood... immediately" signals a positive word denoting high clarity.',
        optionExplanations: {
          'Lucid': '✅ Correct! "Lucid" means crystal-clear and easily intelligible, perfectly fitting the sentence context.',
          'Obscure': '❌ Incorrect. "Obscure" means difficult to see or understand, the opposite of the context clue.',
          'Ambivalent': '❌ Incorrect. "Ambivalent" means having mixed or contradictory feelings, which makes no sense in this context.',
          'Convoluted': '❌ Incorrect. "Convoluted" means overly intricate and complex, contradicting the fact that the panel understood immediately.',
        },
      },
      {
        id: 'q1-5',
        type: 'typing',
        question: 'Verbal Agility Typing Drill: Articulate and type this statement precisely to demonstrate focus and speed.',
        targetTypingText: 'Clear articulation and sound grammatical precision are the cornerstones of successful placement interviews.',
        explanation: 'Demonstrates typing accuracy and active memory retention under timed conditions.',
      },
    ],
  },
  {
    id: 'ch-2',
    day: 2,
    title: 'Day 2 Corporate Communication & Email Refinement',
    timeLimitMinutes: 12,
    passingScore: 75,
    questions: [
      {
        id: 'q2-1',
        type: 'mcq',
        question: 'Which of the following email subject lines best follows the BLUF (Bottom Line Up Front) executive standard?',
        options: [
          'Quick Question regarding tomorrow',
          'Urgent!! Pls read!!',
          '[Action Required] Sign-off on AWS Staging Budget by 4 PM Today',
          'Status of the project and some things we discussed last week',
        ],
        correctAnswer: '[Action Required] Sign-off on AWS Staging Budget by 4 PM Today',
        explanation: 'A strong subject line includes the action category, topic, and concrete deadline upfront.',
        ruleReference: 'Corporate Email Etiquette: Executive inboxes receive 100+ emails daily. High-impact subject lines specify [Tag/Action Required] + Context + Exact Deadline.',
        optionExplanations: {
          'Quick Question regarding tomorrow': '❌ Incorrect. Vague and ambiguous; forces the recipient to open the email to guess what it is about.',
          'Urgent!! Pls read!!': '❌ Incorrect. Unprofessional punctuation ("!!") and informal slang ("Pls") destroy executive presence.',
          '[Action Required] Sign-off on AWS Staging Budget by 4 PM Today': '✅ Correct! Exemplifies BLUF: clearly tags the call to action, the specific budget scope, and the concrete deadline.',
          'Status of the project and some things we discussed last week': '❌ Incorrect. Rambling and non-actionable; leaves the recipient unsure of urgency.',
        },
      },
      {
        id: 'q2-2',
        type: 'paragraph',
        question: 'Refactor this defensive statement into a diplomatic, constructive professional reply: "It is not my fault that the build failed; the other team did not update their API dependencies."',
        instructions: 'Write a refined 1-2 sentence corporate response highlighting proactive solutions.',
        correctAnswer: 'The build failure appears linked to recent upstream API updates. I am coordinating with the dependencies team right now to synchronize versions and ensure a smooth deployment.',
        explanation: 'Great professionals focus on root-cause analysis and collaborative remediation rather than finger-pointing.',
      },
      {
        id: 'q2-3',
        type: 'mcq',
        question: 'Which phrase is considered modern best practice when closing an email with next steps?',
        options: [
          'Please revert at your earliest convenience and oblige.',
          'Please let me know if you approve this approach by Thursday noon so we can proceed with sprint deployment.',
          'Hoping for your kind favor regarding the above mentioned.',
          'Do the needful.',
        ],
        correctAnswer: 'Please let me know if you approve this approach by Thursday noon so we can proceed with sprint deployment.',
        explanation: 'Clear deadlines and direct language replace archaic clichés like "do the needful" and "please revert".',
        ruleReference: 'Modern Business Communication: Global engineering firms (Google, Microsoft, Amazon) discourage colonial-era phrases like "do the needful" in favor of specific ownership and timelines.',
        optionExplanations: {
          'Please revert at your earliest convenience and oblige.': '❌ Incorrect. "Revert" means to return to a previous state, not to reply. "And oblige" is outdated Victorian business jargon.',
          'Please let me know if you approve this approach by Thursday noon so we can proceed with sprint deployment.': '✅ Correct! Clear, proactive, respectful, and sets a tangible target ("Thursday noon") tied to a business milestone.',
          'Hoping for your kind favor regarding the above mentioned.': '❌ Incorrect. Subservient, archaic tone that diminishes executive authority.',
          'Do the needful.': '❌ Incorrect. Ambiguous, outdated, and universally considered a corporate anti-pattern by global hiring panels.',
        },
      },
      {
        id: 'q2-4',
        type: 'vocabulary',
        question: 'Identify the antonym of "AMBIGUOUS" in requirements documentation:',
        options: ['Equivocal', 'Explicit', 'Vague', 'Cryptic'],
        correctAnswer: 'Explicit',
        explanation: 'Explicit means stated clearly and in detail, leaving no room for confusion or doubt.',
        ruleReference: 'Antonym Precision: Ambiguous means open to multiple interpretations or vague. Its direct antonym is explicit (fully and clearly expressed).',
        optionExplanations: {
          'Equivocal': '❌ Incorrect. "Equivocal" means ambiguous or open to more than one interpretation—a synonym, not an antonym.',
          'Explicit': '✅ Correct! "Explicit" means leaving nothing implied or uncertain; completely clear and precise.',
          'Vague': '❌ Incorrect. "Vague" is a direct synonym of ambiguous.',
          'Cryptic': '❌ Incorrect. "Cryptic" means having a hidden or mysterious meaning, also closely related to ambiguous.',
        },
      },
    ],
  },
  {
    id: 'ch-3',
    day: 3,
    title: 'Day 3 Placement Crucible: Mock Interview & Spontaneous Speaking',
    timeLimitMinutes: 15,
    passingScore: 75,
    questions: [
      {
        id: 'q3-1',
        type: 'mcq',
        question: 'In the STAR interview method, which component should occupy the largest share of your response time?',
        options: [
          'Situation (giving complete background history)',
          'Task (explaining what your manager told you to do)',
          'Action (the specific steps, decisions, and leadership you took)',
          'Result (listing general feelings about the project)',
        ],
        correctAnswer: 'Action (the specific steps, decisions, and leadership you took)',
        explanation: 'Interviewers hire YOUR capabilities; spend ~60% of your time explaining your exact actions, trade-offs, and initiatives.',
        ruleReference: 'STAR Calibration: S (15%) + T (10%) + A (60%) + R (15%). Hiring managers care most about your personal technical decisions, trade-offs, and execution.',
        optionExplanations: {
          'Situation (giving complete background history)': '❌ Incorrect. Spending too much time on background history bores the interviewer and cuts short your technical depth.',
          'Task (explaining what your manager told you to do)': '❌ Incorrect. The task should only take 15-20 seconds to establish your explicit role.',
          'Action (the specific steps, decisions, and leadership you took)': '✅ Correct! The "Action" phase should comprise ~60% of your answer. This is where you demonstrate your architectural reasoning, code quality, and problem-solving grit.',
          'Result (listing general feelings about the project)': '❌ Incorrect. Results must be quantified metrics (e.g. 40% speedup), not subjective feelings.',
        },
      },
      {
        id: 'q3-2',
        type: 'speaking',
        question: 'Placement Voice Simulation: Record or articulate your 60-second pitch for: "Tell me about a challenging technical hurdle you overcame."',
        speakingPrompt: 'Speak for 45-60 seconds. Address: 1) What was the technical problem? 2) What hypothesis or debugging step did you lead? 3) What was the measurable outcome?',
        explanation: 'Practices spontaneous executive delivery, elimination of filler words, and vocal modulation.',
      },
      {
        id: 'q3-3',
        type: 'mcq',
        question: 'Which resume bullet point demonstrates the highest corporate impact?',
        options: [
          'Worked on user authentication using React and Node.',
          'Responsible for bug fixes and maintaining the login page for clients.',
          'Architected OAuth2 JWT authentication flow, slashing unauthorized latency by 45% across 25,000 daily active sessions.',
          'Helped the senior engineer with databases and security.',
        ],
        correctAnswer: 'Architected OAuth2 JWT authentication flow, slashing unauthorized latency by 45% across 25,000 daily active sessions.',
        explanation: 'Strong resume bullets use a strong action verb + technical scope + quantified metric.',
        ruleReference: 'Google XYZ Resume Formula: Accomplished [X], as measured by [Y], by doing [Z]. Always lead with an assertive action verb.',
        optionExplanations: {
          'Worked on user authentication using React and Node.': '❌ Incorrect. Weak passive verb ("Worked on") with zero quantified impact or specific achievements.',
          'Responsible for bug fixes and maintaining the login page for clients.': '❌ Incorrect. Describes a job duty rather than an accomplishment; lacks metrics and scale.',
          'Architected OAuth2 JWT authentication flow, slashing unauthorized latency by 45% across 25,000 daily active sessions.': '✅ Correct! Follows the gold-standard XYZ formula: strong verb ("Architected"), technical scope ("OAuth2 JWT flow"), and quantified impact ("slashed latency by 45% across 25,000 daily active sessions").',
          'Helped the senior engineer with databases and security.': '❌ Incorrect. "Helped" minimizes your own contribution and sounds like an unpaid bystander.',
        },
      },
      {
        id: 'q3-4',
        type: 'sentence_correction',
        question: 'Spot the subtle error: "Neither of the two candidates have completed their technical interview rounds."',
        options: [
          'Change "Neither" to "None"',
          'Change "have" to "has", because "Neither" takes a singular verb',
          'Change "their" to "there"',
          'No error',
        ],
        correctAnswer: 'Change "have" to "has", because "Neither" takes a singular verb',
        explanation: '"Neither" refers to one or the other individually and requires the singular verb "has".',
        ruleReference: 'Pronoun-Verb Concord: "Neither" and "Either" as subjects take singular verbs when referring to two distinct items.',
        optionExplanations: {
          'Change "Neither" to "None"': '❌ Incorrect. "Neither" specifically applies to two entities; "none" is reserved for three or more.',
          'Change "have" to "has", because "Neither" takes a singular verb': '✅ Correct! "Neither" is an indefinite pronoun that is singular and takes the singular verb "has completed".',
          'Change "their" to "there"': '❌ Incorrect. "There" is an adverb of place; "their" is the possessive pronoun.',
          'No error': '❌ Incorrect. "Neither... have" is a grammatical mismatch.',
        },
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to VerbalEdge! 🚀',
    message: 'Day 1 is officially live. Complete your first assignment and challenge to claim your Day 1 Challenger Badge!',
    type: 'announcement',
    timestamp: 'Today at 09:00 AM',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Live Q&A Doubt Clearance with Kapil',
    message: 'Trainer Kapil Narula is online to review speaking prompts and grammar doubts in the 1-on-1 messaging tab.',
    type: 'reminder',
    timestamp: 'Today at 11:30 AM',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Day 2 Preview Ready',
    message: 'Executive email templates & corporate communication challenges unlocked soon. Keep your streak alive!',
    type: 'announcement',
    timestamp: 'Today at 02:00 PM',
    read: true,
  },
];

export const INITIAL_LEARNERS: Learner[] = [
  {
    id: 'VE-2026-7701',
    name: 'Ananya Sharma',
    joinedAt: '2026-09-03',
    currentDay: 3,
    completedDays: [1, 2, 3],
    progressPercentage: 100,
    xp: 940,
    streak: 3,
    dayStatus: {
      1: { assignmentViewed: true, challengeCompleted: true, score: 95, maxScore: 100, timeSpentSec: 320, badgeIssued: true, badgeId: 'VE-BDG-D1-7701', certificateIssued: true, certificateId: 'VE-CRT-D1-7701' },
      2: { assignmentViewed: true, challengeCompleted: true, score: 90, maxScore: 100, timeSpentSec: 410, badgeIssued: true, badgeId: 'VE-BDG-D2-7701', certificateIssued: true, certificateId: 'VE-CRT-D2-7701' },
      3: { assignmentViewed: true, challengeCompleted: true, score: 95, maxScore: 100, timeSpentSec: 540, badgeIssued: true, badgeId: 'VE-BDG-D3-7701', certificateIssued: true, certificateId: 'VE-CRT-GR-7701' },
    },
    badges: [
      {
        badgeId: 'VE-BDG-D1-7701',
        day: 1,
        title: 'Day 1 Challenger',
        learnerId: 'VE-2026-7701',
        learnerName: 'Ananya Sharma',
        issuedDate: 'Sep 3, 2026',
        verificationUrl: '/verify/VE-BDG-D1-7701',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
      {
        badgeId: 'VE-BDG-D2-7701',
        day: 2,
        title: 'Day 2 Communicator',
        learnerId: 'VE-2026-7701',
        learnerName: 'Ananya Sharma',
        issuedDate: 'Sep 4, 2026',
        verificationUrl: '/verify/VE-BDG-D2-7701',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
      {
        badgeId: 'VE-BDG-D3-7701',
        day: 3,
        title: 'Day 3 Placement Warrior',
        learnerId: 'VE-2026-7701',
        learnerName: 'Ananya Sharma',
        issuedDate: 'Sep 5, 2026',
        verificationUrl: '/verify/VE-BDG-D3-7701',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
    ],
    certificates: [
      {
        certId: 'VE-CRT-D1-7701',
        type: 'day1',
        title: 'Day 1 Verbal Foundations Certificate',
        day: 1,
        learnerId: 'VE-2026-7701',
        learnerName: 'Ananya Sharma',
        issuedDate: 'Sep 3, 2026',
        verificationUrl: '/verify/VE-CRT-D1-7701',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        digitalSignature: 'Kapil Narula',
        theme: 'standard',
        score: 95,
        daysCompleted: 1,
        isValid: true,
      },
      {
        certId: 'VE-CRT-GR-7701',
        type: 'grand',
        title: 'Grand Placement Readiness Master Certificate',
        day: 'grand',
        learnerId: 'VE-2026-7701',
        learnerName: 'Ananya Sharma',
        issuedDate: 'Sep 5, 2026',
        verificationUrl: '/verify/VE-CRT-GR-7701',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        digitalSignature: 'Kapil Narula',
        theme: 'gold',
        score: 94,
        daysCompleted: 3,
        isValid: true,
      },
    ],
  },
  {
    id: 'VE-2026-8822',
    name: 'Rohit Verma',
    joinedAt: '2026-09-04',
    currentDay: 2,
    completedDays: [1],
    progressPercentage: 55,
    xp: 520,
    streak: 2,
    dayStatus: {
      1: { assignmentViewed: true, challengeCompleted: true, score: 85, maxScore: 100, timeSpentSec: 410, badgeIssued: true, badgeId: 'VE-BDG-D1-8822', certificateIssued: true, certificateId: 'VE-CRT-D1-8822' },
      2: { assignmentViewed: true, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 150, badgeIssued: false, certificateIssued: false },
      3: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
    },
    badges: [
      {
        badgeId: 'VE-BDG-D1-8822',
        day: 1,
        title: 'Day 1 Challenger',
        learnerId: 'VE-2026-8822',
        learnerName: 'Rohit Verma',
        issuedDate: 'Sep 4, 2026',
        verificationUrl: '/verify/VE-BDG-D1-8822',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
    ],
    certificates: [
      {
        certId: 'VE-CRT-D1-8822',
        type: 'day1',
        title: 'Day 1 Verbal Foundations Certificate',
        day: 1,
        learnerId: 'VE-2026-8822',
        learnerName: 'Rohit Verma',
        issuedDate: 'Sep 4, 2026',
        verificationUrl: '/verify/VE-CRT-D1-8822',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        digitalSignature: 'Kapil Narula',
        theme: 'standard',
        score: 85,
        daysCompleted: 1,
        isValid: true,
      },
    ],
  },
  {
    id: 'VE-2026-9934',
    name: 'Priya Patel',
    joinedAt: '2026-09-04',
    currentDay: 2,
    completedDays: [1, 2],
    progressPercentage: 70,
    xp: 680,
    streak: 2,
    dayStatus: {
      1: { assignmentViewed: true, challengeCompleted: true, score: 90, maxScore: 100, timeSpentSec: 360, badgeIssued: true, badgeId: 'VE-BDG-D1-9934', certificateIssued: true, certificateId: 'VE-CRT-D1-9934' },
      2: { assignmentViewed: true, challengeCompleted: true, score: 88, maxScore: 100, timeSpentSec: 390, badgeIssued: true, badgeId: 'VE-BDG-D2-9934', certificateIssued: true, certificateId: 'VE-CRT-D2-9934' },
      3: { assignmentViewed: false, challengeCompleted: false, score: 0, maxScore: 100, timeSpentSec: 0, badgeIssued: false, certificateIssued: false },
    },
    badges: [
      {
        badgeId: 'VE-BDG-D1-9934',
        day: 1,
        title: 'Day 1 Challenger',
        learnerId: 'VE-2026-9934',
        learnerName: 'Priya Patel',
        issuedDate: 'Sep 4, 2026',
        verificationUrl: '/verify/VE-BDG-D1-9934',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
      {
        badgeId: 'VE-BDG-D2-9934',
        day: 2,
        title: 'Day 2 Communicator',
        learnerId: 'VE-2026-9934',
        learnerName: 'Priya Patel',
        issuedDate: 'Sep 5, 2026',
        verificationUrl: '/verify/VE-BDG-D2-9934',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        isValid: true,
      },
    ],
    certificates: [
      {
        certId: 'VE-CRT-D1-9934',
        type: 'day1',
        title: 'Day 1 Verbal Foundations Certificate',
        day: 1,
        learnerId: 'VE-2026-9934',
        learnerName: 'Priya Patel',
        issuedDate: 'Sep 4, 2026',
        verificationUrl: '/verify/VE-CRT-D1-9934',
        qrCodeDataUrl: '',
        workshopName: 'VerbalEdge',
        trainer: 'Kapil Narula',
        digitalSignature: 'Kapil Narula',
        theme: 'standard',
        score: 90,
        daysCompleted: 1,
        isValid: true,
      },
    ],
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    learnerId: 'VE-2026-7701',
    sender: 'learner',
    text: 'Hi Kapil sir! In Day 3 STAR approach, should the Result section always include financial figures or are engineering metrics like latency acceptable?',
    timestamp: '10:15 AM',
    read: true,
  },
  {
    id: 'msg-2',
    learnerId: 'VE-2026-7701',
    sender: 'admin',
    text: 'Great question Ananya! Technical and operational metrics like % latency drop, query optimization speed, or bug reduction rate are fantastic for campus placement panels. Always highlight the before vs. after comparison.',
    timestamp: '10:18 AM',
    read: true,
  },
];
