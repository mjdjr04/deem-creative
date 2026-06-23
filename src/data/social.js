// Social media work, grouped by role / organization.
//
// Static, bundled content (like the other src/data/* DEFAULTS). Images live in
// public/assets/social/<org>/... — single-image posts use `image`; multi-slide
// carousels either list `images` explicitly or use `dir` + `count` (slides are
// stored as 01.png, 02.png, … inside `dir`).
//
// Rendered by src/components/SocialMedia.jsx as a sub-section of the Portfolio
// page (below the Feed).

// Build the normalized image-URL list for a post.
export function postImages(p) {
  if (Array.isArray(p.images)) return p.images
  if (p.image) return [p.image]
  if (p.dir && p.count) {
    return Array.from(
      { length: p.count },
      (_, i) => `${p.dir}/${String(i + 1).padStart(2, '0')}.png`
    )
  }
  return []
}

export const socialOrgs = [
  {
    id: 'jag-nj',
    org: 'JAG New Jersey',
    role: 'Social Media Marketing Assistant',
    sub: 'NJ Chamber of Commerce Foundation',
    period: '2025–Present',
    blurb:
      'Manage content strategy and publishing across Instagram, Facebook, LinkedIn, and X for New Jersey\'s JAG workforce-development program — driving 462% growth in Instagram views, 317% in reach, and 696% in audience interactions through branded graphics, carousels, and sponsor campaigns.',
    link: { label: 'Instagram', url: 'https://www.instagram.com/jagnewjersey' },
    posts: [
      { title: 'Shine Collective Scholars', description: 'Recognition graphic celebrating JAG NJ students selected as Shine Collective Scholars.', image: '/assets/social/jag-nj/1-shine-collective-scholars.png' },
      { title: '2025 Custard Power 50', description: 'Feature graphic spotlighting JAG New Jersey\'s recognition on the 2025 Custard Power 50 list.', image: '/assets/social/jag-nj/1-2025-custard-power-50.png' },
      { title: 'Workforce Ready Youth Summit', description: 'Multi-slide recap of the Workforce Ready Youth Summit.', dir: '/assets/social/jag-nj/2-workforce-ready-youth-summit', count: 5 },
      { title: "President's Day", description: "President's Day holiday graphic for JAG New Jersey's channels.", image: '/assets/social/jag-nj/2-presidents-day.png' },
      { title: 'Common App Guide', description: 'Step-by-step carousel guiding students through the Common Application.', dir: '/assets/social/jag-nj/3-common-app', count: 9, top: true },
      { title: 'Graduation', description: 'Celebratory post honoring JAG NJ graduating seniors.', image: '/assets/social/jag-nj/3-graduation.png' },
      { title: 'Feel Good Friday: Student Success Stories', description: 'Student success story series spotlighting JAG participants across New Jersey schools.', dir: '/assets/social/jag-nj/4-feel-good-friday-student-success-story', count: 7 },
      { title: 'Internships', description: 'Carousel highlighting JAG internship opportunities and how to apply.', dir: '/assets/social/jag-nj/4-internships', count: 7 },
      { title: 'CDC 2026 Winners', description: 'Carousel announcing winners across the Career Development Conference 2026 competition categories.', dir: '/assets/social/jag-nj/5-cdc-2026-winners', count: 13, top: true },
      { title: 'Welcome New Specialists 2025', description: "Welcome graphic introducing JAG NJ's newest specialists for the 2025 program year.", image: '/assets/social/jag-nj/6-welcome-new-specialists-2025.png' },
      { title: 'Call for Internships', description: 'Promotional graphic recruiting students for JAG internship opportunities.', image: '/assets/social/jag-nj/7-call-for-internships.png' },
      { title: 'AAPI Heritage Month', description: 'Heritage-month graphic recognizing Asian American and Pacific Islander Heritage Month.', image: '/assets/social/jag-nj/8-asian-american-pacific-islander-heritage-month.png' },
      { title: 'Hispanic Heritage Month', description: 'Heritage-month graphic celebrating Hispanic Heritage Month.', image: '/assets/social/jag-nj/9-jag-hispanic-heritage-month-2025.png' },
      { title: 'LDC 2025 Recap', description: 'Recap carousel from the 2025 Leadership Development Conference.', dir: '/assets/social/jag-nj/10-ldc-2025-recap', count: 7 },
      { title: "Women's History Month", description: "Women's History Month carousel.", dir: '/assets/social/jag-nj/11-womens-history-month', count: 2 },
      { title: 'Scholarship Application Tips', description: 'Educational carousel sharing practical tips for scholarship applications.', dir: '/assets/social/jag-nj/12-scholarship-application-tips', count: 9 },
      { title: "Veterans Day", description: 'Veterans Day tribute graphic.', image: '/assets/social/jag-nj/13-veterans-day.png' },
      { title: 'Native American Heritage Month', description: 'Carousel recognizing Native American Heritage Month.', dir: '/assets/social/jag-nj/14-native-american-heratige', count: 4 },
      { title: 'Sponsor Recognition', description: 'Series of tiered sponsor recognition graphics thanking JAG NJ partners and funders.', dir: '/assets/social/jag-nj/16-sponsor-recognition-posts', count: 15, top: true },
      { title: 'FAFSA 2026–27', description: 'Informational graphic reminding students and families about the 2026–27 FAFSA.', image: '/assets/social/jag-nj/17-fafsa-2026-27.png' },
      { title: 'Black History Month 2026', description: 'Black History Month graphic for the 2026 observance.', image: '/assets/social/jag-nj/19-bhm-2026.png' },
      { title: 'JAG NJ Network 2025', description: 'Carousel promoting the 2025 JAG NJ Network.', dir: '/assets/social/jag-nj/20-jag-nj-network-2025', count: 3 },
      { title: 'Specialist Thank-Yous (Story)', description: 'Instagram Story series thanking JAG specialists across the state.', dir: '/assets/social/jag-nj/22-jag-specialists-thank-yous-story', count: 5 },
      { title: 'Top 10 Employability Skills', description: 'Educational carousel counting down the top 10 employability skills.', dir: '/assets/social/jag-nj/23-top-10-employability-skills', count: 12, top: true },
      { title: 'Specialist Appreciation Week', description: 'Appreciation graphic thanking JAG specialists during Specialist Appreciation Week.', image: '/assets/social/jag-nj/24-specialist-appreciation-week.png' },
      { title: 'Thanksgiving 2025', description: 'Thanksgiving holiday graphic for JAG New Jersey.', image: '/assets/social/jag-nj/25-thanksgiving-2025.png' },
      { title: 'GivingTuesday 2025', description: 'GivingTuesday campaign carousel driving year-end donations.', dir: '/assets/social/jag-nj/27-givingtuesday-2025', count: 3 },
      { title: 'JAG Quote Series', description: 'Quote-graphic series sharing motivational messaging.', dir: '/assets/social/jag-nj/28-jag-quote', count: 3 },
      { title: 'Arab American Heritage Month', description: 'Heritage-month graphic recognizing Arab American Heritage Month.', image: '/assets/social/jag-nj/29-arab-american-heritage-month.png' },
      { title: 'GivingTuesday 2025 — LinkedIn Banner', description: 'GivingTuesday LinkedIn banner supporting the year-end fundraising campaign.', image: '/assets/social/jag-nj/30-givingtuesday-2025-linkedin-banner.png' },
      { title: 'Specialist Thank-Yous', description: 'Feed series thanking JAG specialists for their work with students.', dir: '/assets/social/jag-nj/31-jag-specialists-thank-yous', count: 5 },
    ],
  },
  {
    id: 'rider-sga',
    org: 'Rider University SGA',
    role: 'Vice President for Communications',
    sub: 'Student Government Association',
    period: '2023–2025',
    blurb:
      "Led communications and social media as Vice President for Communications of Rider University's Student Government Association — producing graphics for campus initiatives, awareness campaigns, heritage observances, and student events.",
    posts: [
      { title: 'Welcome Week', description: 'Welcome Week graphic introducing students to SGA and campus life.', image: '/assets/social/rider-sga/welcome-week.jpg', top: true },
      { title: 'Clubs & Organizations', description: 'Promotional graphic encouraging students to get involved with campus clubs and organizations.', image: '/assets/social/rider-sga/clubs-and-organizations.jpg' },
      { title: 'SGA Elections', description: 'Get-out-the-vote graphic encouraging students to vote in SGA elections.', image: '/assets/social/rider-sga/sga-elections.jpg', top: true },
      { title: 'Campus Safety Preparedness Committee', description: "Informational graphic for SGA's Campus Safety Preparedness Committee.", image: '/assets/social/rider-sga/campus-safety-preparedness-committee.jpg' },
      { title: 'Updating Pronouns', description: 'Informational graphic guiding students on updating their pronouns in campus systems.', image: '/assets/social/rider-sga/updating-pronouns.jpg' },
      { title: 'Midnight Breakfast', description: "Promotional graphic for SGA's Midnight Breakfast finals-week event.", image: '/assets/social/rider-sga/midnight-breakfast.jpg' },
      { title: 'Winter Break', description: 'Seasonal graphic wishing students a restful winter break.', image: '/assets/social/rider-sga/winter-break.jpg' },
      { title: 'MLK Jr. Day', description: 'Graphic honoring Dr. Martin Luther King Jr. Day.', image: '/assets/social/rider-sga/mlk-jr-day.jpg' },
      { title: 'Black History Month', description: "Black History Month graphic for SGA's channels.", image: '/assets/social/rider-sga/black-history-month.jpg', top: true },
      { title: 'Juneteenth', description: 'Two-part graphic set commemorating Juneteenth.', images: ['/assets/social/rider-sga/juneteenth-1.jpg', '/assets/social/rider-sga/juneteenth-2.jpg'] },
      { title: 'Pride', description: 'Pride graphic celebrating the LGBTQ+ community.', image: '/assets/social/rider-sga/pride.jpg', top: true },
      { title: 'International Pride Day', description: 'Graphic recognizing International Pride Day.', image: '/assets/social/rider-sga/international-pride-day.jpg' },
      { title: "Pride Doesn't Stop", description: 'Campaign graphic extending Pride messaging beyond Pride Month.', image: '/assets/social/rider-sga/pride-doesnt-stop.jpg' },
    ],
  },
  {
    id: 'circle-k-nj',
    org: 'Circle K New Jersey',
    role: 'District Editor',
    sub: 'Collegiate community-service organization',
    period: '2022–2023',
    blurb:
      'Served as District Editor for Circle K New Jersey, the collegiate community-service organization — designing graphics and digital communications promoting district service projects, conferences, and member engagement.',
    posts: [
      { title: 'Helping Hands', description: "Graphic promoting the district's Helping Hands service initiative.", image: '/assets/social/circle-k-nj/helping-hands.jpg', top: true },
      { title: 'Division-Wide Service Project', description: 'Promotional graphic for a division-wide service project.', image: '/assets/social/circle-k-nj/division-wide-service-project.jpg', top: true },
      { title: 'Virtual Service Project', description: 'Graphic promoting a virtual service project for district members.', image: '/assets/social/circle-k-nj/virtual-service-project.jpg', top: true },
      { title: 'Secretary/Treasurer Meeting', description: 'Announcement graphic for a district Secretary/Treasurer meeting.', image: '/assets/social/circle-k-nj/secretary-treasurer-meeting.jpg' },
      { title: 'Winter Leadership Conference', description: "Promotional graphics for the district's Winter Leadership Conference.", images: ['/assets/social/circle-k-nj/winter-leadership-conference-1.jpg', '/assets/social/circle-k-nj/winter-leadership-conference-2.jpg'], top: true },
    ],
  },
  {
    id: 'rider-semla',
    org: 'Rider University — Semester in Los Angeles',
    role: 'Program Ambassador',
    sub: 'Study-away program',
    period: '2024',
    blurb:
      "As a Program Ambassador for Rider University's Semester in Los Angeles, created promotional content encouraging students to apply for the LA study-away program.",
    posts: [
      { title: 'Semester in Los Angeles', description: "Promotional graphic for Rider's Semester in Los Angeles study-away program.", image: '/assets/social/rider-semla/semester-in-los-angeles.png' },
    ],
  },
]
