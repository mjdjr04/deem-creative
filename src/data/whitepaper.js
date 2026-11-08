// "After the Applause" — Michael's whitepaper, shown at /writing/after-the-applause.
// Facts come from the 2026 Brighter Futures Gala and the BGCCC Event Video
// Framework; keep any new claim sourced.

export const WHITEPAPER = {
  slug: 'after-the-applause',
  title: 'After the Applause',
  subtitle: 'Event storytelling for small nonprofits, from the film to the follow-up',
  byline: 'Michael Deem Jr. · Director of Special Projects, Boys & Girls Clubs of Cumberland County · Deem Creative',
  date: 'November 2026',
  summary: [
    'A small nonprofit’s big event is usually its biggest storytelling moment of the year, and usually treated as a logistics problem. Months go into the venue, the menu, and the seating chart. The story gets one shot on the night, and the thank-yous get whatever energy is left.',
    'This paper is what I learned producing the Boys & Girls Clubs of Cumberland County’s 22nd Anniversary Brighter Futures Gala in October 2026. I made the tribute film. I also built the registration site, the sponsor-ad process, the program book, the check-in screen, and the follow-up. Doing all of it as one person taught me one thing above everything else: the event isn’t the story. It’s the middle of the story.',
    'The organizations that get the most from their events plan the before and the after with the same care as the night itself. Here’s the playbook, in five principles and a timeline you can borrow.',
  ],
  sections: [
    {
      id: 'effort',
      heading: 'The night gets all the effort',
      paragraphs: [
        'Look at any gala timeline and you’ll see where the hours go: the room. The story gets squeezed into a speech and maybe a slideshow. And the follow-up, the part where a guest becomes a donor and a donor becomes a repeat donor, slips the moment the lights come up. Everyone’s exhausted, the inbox is full, and by the time the thank-yous go out the feeling is gone.',
        'On our gala site I wrote one line that sums up the problem: thank-yous after an event are the first thing to slip. Every principle below exists to stop that.',
      ],
    },
    {
      id: 'moment',
      heading: '1. Start with the moment',
      paragraphs: [
        'Every event needs one piece that tells the room why the organization matters before anyone speaks. For us, that was a tribute film honoring our two honorees, built from interviews with six people who know the Club, from Club leadership to the mayor of Vineland.',
        'I planned it before filming a frame:',
      ],
      bullets: [
        'An interview framework, so every conversation fed one arc instead of six separate speeches.',
        'A section flow, so the film had a beginning, a turn, and a reason to give.',
        'Cut-downs for social, planned from the start, so the same footage kept working after the night.',
      ],
      after: [
        'The film opened the room, then lived on the thank-you page where guests could watch it again and share it. One shoot, many lives.',
        'If you take one thing from this section: decide what the room should feel in the first five minutes, and build that first.',
      ],
    },
    {
      id: 'touchpoints',
      heading: '2. Every touchpoint is the story',
      paragraphs: [
        'A guest’s experience of your mission starts long before they walk in: the invitation, the registration page, the confirmation email, the program book on the table, the person who greets them at the door. Each of those either feels like your organization or feels like paperwork. So I built them as one system:',
      ],
      bullets: [
        'One registration site where guests buy tickets and sponsors pick a level.',
        'Payments that land in the donor database. Payments through our old link never reached it, which meant reconciling them by hand. Moving ticket payments into DonorDock removed that job.',
        'Prefilled ad forms for sponsors, with a sheet that tracks which ads have arrived and a button that reminds the ones that haven’t. No more chasing artwork by email.',
        'A 28-page program book, printed for the tables and published online exactly as printed.',
        'Check-in on a phone, with every guest listed by name, parties merged, and every staff phone in sync.',
      ],
      after: [
        'None of this is fancy. All of it is the story, because every smooth moment says this organization has its act together, and that’s what a donor is betting on.',
      ],
    },
    {
      id: 'speed',
      heading: '3. Speed is a strategy',
      paragraphs: [
        'For Club events I wrote a simple rule into our event-video playbook. A fundraising event gets a 60-second highlight within 24 hours. A youth program event gets one within 48 hours. A community event gets one within 72 hours.',
        'The reason is in the same document: emotion drives giving, and speed matters. People share a highlight while the memory is fresh. Two weeks later it’s just content. Practically, that means:',
      ],
      bullets: [
        'Know your shot list before the doors open: the arrival, the room, close-up reactions, the speaker with the audience in frame, sponsor signage, a candid conversation, a quiet moment, the exit.',
        'Get close. Wide shots of a room don’t move anyone; a face laughing or tearing up does.',
        'Tag partners and ask them to reshare. It’s the cheapest reach you’ll ever get.',
        'Get consent before filming minors, every time, with releases on file.',
      ],
    },
    {
      id: 'thank-you',
      heading: '4. The thank-you is a second premiere',
      paragraphs: [
        'After the gala, I turned the registration site into a thank-you page with the tribute film, the photo album, and the program book. Then the post-gala emails went out, with a certificate of appreciation for each of our 18 sponsors, and a recap press release went to about 30 regional outlets.',
        'That turned the after from a chore into a second event: a moment when every guest and sponsor hears “you made this happen,” with the film and photos to prove it. It’s also the most natural moment to invite the next gift, like the 100 Chair Club we launched to furnish the new Club at $100 a chair.',
      ],
    },
    {
      id: 'tools',
      heading: '5. Build the smallest tool that removes a chore',
      paragraphs: [
        'Small nonprofits don’t need enterprise software. They need the one small tool that removes the one chore eating a staff member’s week. On this gala that meant a reminder button instead of a dozen follow-up emails, a prefilled form instead of a back-and-forth about ad sizes, and a check-in screen instead of a clipboard and three printed lists.',
        'My rule for build versus buy:',
      ],
      numbered: [
        'Buy when a tool you already pay for does it. We used DonorDock rather than reinventing payments.',
        'Build when the job is specific to you, small, and repeated: a sponsor tracker, a check-in list, a certificate generator.',
        'Never build something nobody on staff can keep running. Write it down, keep it simple, and hand it off.',
      ],
    },
    {
      id: 'timeline',
      heading: 'A timeline you can steal',
      table: {
        columns: ['When', 'Story', 'System'],
        rows: [
          ['8 weeks out', 'Pick the one moment; plan the film’s interview framework', 'Launch registration and sponsor levels; set up the tracking sheet'],
          ['6 weeks out', 'Film interviews', 'Send sponsor ad forms; begin reminders'],
          ['3 weeks out', 'Edit the film; plan the social cut-downs', 'Lock the program book; send the press preview'],
          ['1 week out', 'Final film; write the shot list for the night', 'Test check-in on real phones with real staff'],
          ['The night', 'Capture reactions, not just the room', 'Phone check-in; one live guest list'],
          ['+24 hours', 'Post the highlight', 'Thank-you page goes live'],
          ['+1 week', 'Recap release; share the full film', 'Thank-you emails and sponsor certificates'],
          ['+2 weeks', 'Invite the next gift', 'Reconcile once, in the donor database, not three spreadsheets'],
        ],
      },
    },
    {
      id: 'measure',
      heading: 'What to measure',
      paragraphs: ['Track a few numbers every time, so next year’s event starts smarter:'],
      bullets: [
        'Registrations versus check-ins',
        'Revenue by source: tickets, sponsorships, ads, the ask',
        'Highlight-video views and shares in the first 72 hours',
        'Thank-you email opens',
        'Gifts in the 30 days after the event',
      ],
    },
  ],
  about:
    'I’m Michael Deem Jr., a filmmaker and builder for organizations that serve their communities. I’m Director of Special Projects at the Boys & Girls Clubs of Cumberland County in Vineland, New Jersey, and I run Deem Creative, a studio for story films, social, and small tools. I’ve edited for FOX Sports Digital, grown the NJ Chamber of Commerce Foundation’s Instagram views 462%, and helped run the Bonner Foundation’s 450-person national leadership institute. If you’re planning an event and want the story to outlast the night, let’s talk.',
}

export const getWhitepaper = (slug) => (slug === WHITEPAPER.slug ? WHITEPAPER : null)
