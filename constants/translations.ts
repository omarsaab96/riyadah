export type Language = 'en' | 'ar';

export const translations = {
  en: {
    common: {
      english: 'English',
      arabic: 'Arabic',
      loading: 'Loading...',
      verified: 'Verified',
      pending: 'Pending',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Account settings',
      accountSettings: 'Account settings',
      changePassword: 'Change password',
      badge: 'Riyadah badge',
      verification: 'Account verification',
      language: 'Language',
      languageHint: 'Change the app language and layout direction.',
      terms: 'Terms and conditions',
      privacy: 'Privacy policy',
      website: 'Visit Riyadah website',
      deactivate: 'Deactivate account',
      logout: 'Logout',
      ghost: 'Settin',
    },
    surveyRespond: {
      titleFallback: 'Survey',
      back: 'Back',
      previewMode: 'Preview mode',
      userNotAuthenticated: 'User not authenticated',
      failedToLoad: 'Failed to load survey',
      unavailableTitle: 'Survey unavailable',
      unavailableMessage: 'No survey was found to submit.',
      sessionRequiredTitle: 'Session required',
      sessionRequiredMessage: 'This survey is only available after a training session.',
      requiredFieldsTitle: 'Please fill all required fields',
      requiredFieldsMessage: 'All required fields are mandatory.',
      failedToSubmit: 'Failed to submit survey',
      errorTitle: 'Error',
      failedToSubmitMessage: 'Failed to submit survey.',
      afterTrainingHint: 'This survey is available after a training session.',
      typeYourResponse: 'Type your response',
      answer: 'Answer',
      submitting: 'Submitting',
      submit: 'Submit',
      submittedSuccessfully: 'Survey submitted successfully!',
    },
    auth: {
      back: 'Back',
      loginTitle: 'Login',
      loginSubtitle: "Let's get started!",
      needAccount: 'Need a new account?',
      registerHere: 'REGISTER HERE',
      loginHere: 'LOGIN HERE',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      next: 'NEXT',
      loggingIn: 'LOGGING IN',
      login: 'LOGIN',
      pleaseFillEmailPassword: 'Please fill email and password',
      loginFailed: 'Login failed. Please try again',
      pleaseEnterEmail: 'Please enter email',
      emailCheckFailed: 'Email check failed. Please try again',
      createAccountTitle: 'Create your Account',
      continueAccountTitle: 'Continue Creating your Account',
      createAccountSubtitle: 'Join the energy, unite with athletes like you!',
      name: 'Name',
      phoneNumber: 'Phone number',
      passwordHint: 'Password must be at least 6 character long and include 1 capital letter and 1 symbol',
      agreePrefix: "I agree to Riyadah's ",
      termsAndConditions: 'Terms and Conditions',
      creating: 'CREATING',
      create: 'CREATE',
      account: 'ACCOUNT',
      alreadyHaveAccount: 'Already have an account?',
      disclaimer: "By creating and using an account on Riyadah, you are agreeing to the Riyadah's terms and conditions and privacy policy terms and clauses.",
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      passwordMin: 'Password should be at least 6 characters',
      fillAllFields: 'Please fill all fields and agree to our terms',
    },
    search: {
      placeholder: 'Search (Min. 3 characters)',
      filters: 'Filters',
      searchByPosition: 'Search by position',
      enterPosition: 'Enter position',
      searchIn: 'Search in',
      searchFor: 'Search for',
      gender: 'Gender',
      sport: 'Sport',
      filter: 'Filter',
      athletes: 'Athletes',
      athlete: 'Athlete',
      clubs: 'Clubs',
      club: 'Club',
      federations: 'Federations',
      federation: 'Federation',
      coaches: 'Coaches',
      coach: 'Coach',
      all: 'All',
      users: 'Users',
      teams: 'Teams',
      events: 'Events',
      posts: 'Posts',
      football: 'Football',
      basketball: 'Basketball',
      tennis: 'Tennis',
      swimming: 'Swimming',
      gymnastics: 'Gymnastics',
      male: 'Male',
      female: 'Female',
    },
    notifications: {
      title: 'Notifications',
      ghost: 'Notifi',
      unreadSingle: 'You have 1 unread notification',
      unreadPlural: 'You have {count} unread notifications',
      empty: 'No notifications',
      markAllRead: 'Mark all as read',
      markRead: 'Mark as read',
      delete: 'Delete',
      now: 'now',
      minutesAgo: '{count}m ago',
      hoursAgo: '{count}h ago',
    },
    messages: {
      title: 'Messages',
      noChats: 'No chats yet',
      deleteChat: 'Delete chat',
      areYouSure: 'Are you sure?',
      yesDelete: 'Yes, delete',
      no: 'No',
      cancel: 'Cancel',
      newMessage: 'New message',
      searchUsers: 'Search users',
      noUsersYet: 'No users yet',
      noUsersFound: 'No users found',
      unknownUser: 'Unknown user',
      noMessages: 'No messages yet',
      errorTitle: 'Error',
      selectUser: 'Please select a user',
      failedCreateChat: 'Failed to create chat',
      somethingWentWrong: 'Something went wrong',
      now: 'now',
      minutesAgo: '{count}m ago',
      hoursAgo: '{count}h ago',
    },
    chat: {
      back: 'Back',
      termsDisclaimer: 'By chatting through Riyadah app, you agree to the terms and conditions and privacy policy',
      typeMessage: 'Type a message...',
      failedLoad: 'Failed to load chat',
      failedSend: 'Failed to send message',
    },
    home: {
      headline: 'SET GOALS,\nCRUSH THEM,\nREPEAT.',
      subtext: 'Connect, compete, and thrive with athletes & fans in your city and beyond.',
      login: 'LOGIN',
      createAccount: 'CREATE ACCOUNT',
    },
    attendance: {
      title: 'Attendance sheet',
      ghost: 'Attend',
      failedFetch: 'Failed to fetch attendance data',
      failedConnect: 'Failed to connect to server',
      lockedTitle: 'Attendance locked',
      lockedMessage: 'Attendance can no longer be edited.',
      failedSubmit: 'Failed to submit attendance',
      failedSubmitConnection: 'Failed to submit attendance. Please check your connection.',
      editingClosesIn: 'Editing closes in {time}',
      whoAttended: 'Who attended?',
      selectedHint: 'Selected athletes are the ones that were present.',
      submitLocked: 'Attendance Locked',
      submitting: 'Submitting',
      submit: 'Submit Attendance sheet',
      submitted: 'Attendance sheet submitted successfully!',
    },
    teamDetails: {
      backToTeams: 'Back to teams',
      title: 'Team details',
      uploadLogo: 'Upload logo',
      changeLogo: 'Change logo',
      ageGroup: 'Age Group',
      gender: 'Gender',
      noCoaches: 'No coaches',
      noMembers: 'No members',
      noEvents: 'No events',
      upcomingEvents: 'Upcoming events',
      coachCount: '{count} Coach{suffix}',
      memberCount: '{count} Member{suffix}',
    },
    teamManage: {
      back: 'Back',
      coachesTitle: 'Team Coaches',
      coachesDesc: 'Manage coaches of {name}',
      coachesGhost: 'coaches',
      membersTitle: 'Team Members',
      membersDesc: 'Manage members of {name}',
      membersGhost: 'membe',
      edit: 'Edit',
      done: 'Done',
      addCoachPlaceholder: 'Add coach by name or email (min. 3 characters)',
      addMemberPlaceholder: 'Add athletes by name or email (min. 3 characters)',
      noSport: 'no sport',
      alreadyCoach: 'Already a Coach',
      addAsCoach: '+ Add As Coach',
      alreadyMember: 'Already a member',
      addAsMember: '+ Add As Member',
      noResults: 'No results',
      sure: 'Sure?',
      yes: 'Yes',
      no: 'No',
      authMissing: 'Authentication token missing',
      failedAddCoach: 'Failed to add coach.',
      failedAddMember: 'Failed to add member.',
      addCoachError: 'Something went wrong while adding the coach.',
      addMemberError: 'Something went wrong while adding the member.',
      removeCoachError: 'Error removing coach',
      removeMemberError: 'Error removing member',
    },
    scheduleDetails: {
      back: 'Back',
      title: 'Event details',
      ghost: 'Event',
      noEvent: 'No event found.',
      failedLoad: 'Failed to load event details',
      recurringTitle: 'Recurring Event',
      recurringMessage: 'Do you want to cancel only this occurrence or all future occurrences?',
      thisEventOnly: 'This event only',
      allOccurrences: 'All occurrences',
      cancel: 'Cancel',
      confirmCancel: 'Confirm Cancellation',
      confirmCancelAll: 'Are you sure you want to cancel all future occurrences?',
      confirmCancelOne: 'Are you sure you want to cancel this event?',
      no: 'No',
      yesCancel: 'Yes, cancel',
      failedCancel: 'Failed to cancel event',
      cancelEvent: 'Cancel event',
      edit: 'Edit',
      attendance: 'Attendance',
      eventTitle: 'Title',
      description: 'Description',
      noDescription: 'No description',
      date: 'Date',
      from: 'From',
      till: 'Till',
      location: 'Location',
      scheduled: 'Scheduled',
      cancelled: 'Cancelled',
    },
    scheduleForm: {
      backToSchedule: 'Back to Schedule',
      newEventTitle: 'New Event',
      newEventDesc: 'Create an event for your club',
      editEventTitle: 'Edit Event',
      editEventDesc: 'Update existing event',
      ghost: 'Events',
      eventTitle: 'Event Title *',
      enterEventTitle: 'Enter event title',
      date: 'Date*',
      from: 'From*',
      till: 'Till*',
      eventType: 'Event Type *',
      team: 'Team *',
      description: 'Description',
      enterDescription: 'Enter description',
      recurringEvent: 'Recurring event',
      recurringHint: 'Recurrence will expire automatically after one year.',
      locationType: 'Location Type',
      venueName: 'Venue Name',
      enterVenueName: 'Enter venue name',
      venueAddress: 'Venue Address',
      enterVenueAddress: 'Enter venue address',
      onlineMeetingLink: 'Online Meeting Link',
      enterMeetingLink: 'Enter meeting link',
      venueLocation: 'Venue Location',
      searchLocation: 'Search location...',
      trainingFocus: 'Training Focus',
      trainingFocusPlaceholder: 'E.g. Passing drills, defensive positioning',
      requiredEquipment: 'Required Equipment',
      searchEquipment: 'Search equipment (min. 3 characters)',
      available: 'Available: {count}',
      noEquipmentResults: 'No results. Try another keyword',
      add: 'Add',
      opponentName: 'Opponent Name',
      enterOpponentName: 'Enter opponent team name',
      opponentLogoUrl: 'Opponent Logo URL',
      enterOpponentLogoUrl: 'Enter opponent logo URL',
      homeOrAway: 'Home or Away',
      cancel: 'Cancel',
      saving: 'Saving',
      save: 'Save',
      editing: 'Editing',
      edit: 'Edit',
      fillRequired: 'Please fill in all required fields',
      endTimeAfterStart: 'End time must be after start time',
      failedCreate: 'Failed to create event',
      failedLoad: 'Failed to load event',
      failedUpdate: 'Failed to update event',
      recurringEditTitle: 'Recurring Event',
      recurringEditMessage: 'Do you want to edit only this occurrence or all future occurrences?',
      thisEventOnly: 'This event only',
      allOccurrences: 'All occurrences',
      no: 'No',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      trainingSession: 'Training Session',
      training: 'Training',
      match: 'Match',
      meeting: 'Meeting',
      tournament: 'Tournament',
      venue: 'Venue',
      online: 'Online',
      toBeDetermined: 'To Be Determined',
      homeGame: 'Home Game',
      awayGame: 'Away Game',
    },
    payments: {
      backToFinancials: 'Back to financials',
      newPayment: 'New Payment',
      createPaymentDesc: 'Create a new payment for your club',
      paymentDetails: 'Payment details',
      selectBeneficiary: 'Select beneficiary',
      searchBeneficiary: 'Search by name or email (min. 3 characters)',
      select: 'Select',
      noResults: 'No results.',
      noResultsHint: 'Looks like the user you are looking for does not have an account on Riyadah.',
      selectedUser: 'Selected user',
      amount: 'Amount',
      amountPlaceholder: 'e.g. 50',
      paymentType: 'Payment type',
      registrationFees: 'Club registration fees',
      monthlyFees: 'Monthly subscription fees',
      equipmentPurchase: 'Equipment purchase',
      salary: 'Salary',
      other: 'Other',
      specifyPaymentType: 'Specify payment type',
      note: 'Note',
      notePlaceholder: 'Comment or note ...',
      cancel: 'Cancel',
      paying: 'Paying',
      pay: 'Pay',
      userNotAuthenticated: 'User not authenticated',
      failedSearchUsers: 'Failed to search users',
      failedSave: 'Failed to save payment',
      unexpectedSave: 'Something went wrong. Please try again.',
      authMissing: 'Authentication token missing',
      failedFetch: 'Failed to fetch payment details',
      failedFetchGeneric: 'Something went wrong while fetching payment',
      failedSettle: 'Failed to settle payment',
      errorSettling: 'Error settling payment',
      type: 'Type',
      date: 'Date',
      status: 'Status',
      payer: 'Payer',
      beneficiary: 'Beneficiary',
      pending: 'Pending',
      completed: 'Completed',
      declined: 'Declined',
      paymentNumber: 'Payment# {id}',
    },
    wizard: {
      accountType: 'Account type',
      whatAreYou: 'What are you?',
      next: 'NEXT',
      selectAccountType: 'Kindly select an account type',
      parent: 'Parent',
      athlete: 'Athlete',
      club: 'Club/Academy',
      association: 'Association/Federation',
      scout: 'Scout',
      sponsor: 'Sponsor',
      ghost: 'accou',
      dobTitle: 'Date of birth',
      dobDesc: 'When were you born?',
      establishedTitle: 'Established On',
      establishedDescClub: 'When was the club established?',
      establishedDescAssociation: 'When was the association established?',
      dobGhost: 'DOB',
      sinceGhost: 'SINCE',
      dayRequired: 'Day is required',
      monthRequired: 'Month is required',
      yearRequired: 'Year is required',
      invalidDate: 'Please enter a valid date',
      numbersOnlyDate: 'Please enter only numbers for day, month, and year',
      monthRange: 'Month must be between 01 and 12',
      dayRange: 'Day must be between 01 and {maxDay} for the selected month',
      futureDate: 'Date cannot be in the future',
      parentUnder18: 'Parents cannot be under 18',
      scoutUnder18: 'Scout cannot be under 18',
      sponsorUnder18: 'Sponsor cannot be under 18',
      fillAllFields: 'Kindly fill all fields',
      parentEmailHint: 'Since you are less than 18, kindly enter your parent\'s email address.',
      parentEmail: 'Parent email',
      gender: 'Gender',
      admin: 'Admin',
      adminName: 'Admin name',
      adminEmail: 'Admin email',
      adminHint: 'The system will check if the admin has an account on Riyadah',
      summary: 'Summary',
      bio: 'BIO',
      describeYourself: 'Describe yourself',
      describeClub: 'Describe the club',
      describeAssociation: 'Describe the association',
      creatingAccount: 'Creating account',
      aboutClub: 'About Club',
      aboutYou: 'About You',
      tellUsMoreClub: 'Tell us more about your club',
      tellUsMoreYou: 'Tell us more about you',
      sorryInconvenience: 'Sorry for the inconvenience',
      tryAgain: 'Try again',
      genderRequired: 'Kindly select a gender',
      adminNameRequired: 'Kindly fill admin name',
      adminEmailRequired: 'Kindly fill admin email',
      registrationError: 'Something went wrong. Please try again.',
      sportType: 'Sport type',
      organization: 'Organization',
      whatDoYouDo: 'What do you do?',
      organizationQuestion: 'What organization do you work for?',
      sportGhost: 'Sport',
      organizationGhost: 'Organi',
      noOrganization: "I don't have an organization. I am independent",
      organizationName: 'Organization name',
      organizationLocation: 'Organization Location',
      organizationRole: 'Your role in the organization',
      organizationSince: 'In what year did you start working here?',
      sportsInterested: 'What sports are you interested in?',
      noSportsAvailable: 'No sports available.',
      selectSportType: 'Kindly select a sport type',
      addClubs: 'Add clubs',
      selectClub: 'Select your club',
      associationClubsQuestion: 'What clubs fit under your association?',
      athleteClubQuestion: 'What club do you play with?',
      clubsGhost: 'Clubs',
      clubGhost: 'Club',
      noClubIndependent: "I don't have a club. I am independent",
      athleteIndependentHint: 'By default, all athletes are registered as independent.',
      athleteClubContactHint: 'If you are a member of a club, please contact your club through Riyadah to request being added.',
      searchClubs: 'Search clubs (Min. 3 characters)',
      noClubsFound: 'No clubs found for "{keyword}"',
      selectClubRequired: 'Kindly select a club',
    },
    notFound: {
      title: 'Oops!',
      message: 'This screen does not exist.',
      goHome: 'Go to home screen!',
    },
    badge: {
      back: 'Back',
      title: 'Riyadah badge',
      ghost: 'badge',
      congratulations: 'Congratulations!',
      verifiedMessage: 'Your account is officially verified with Riyadah badge. This helps you stand out, gain trust, and show authenticity in our community.',
      benefitsTitle: 'Your benefits:',
      benefitVisibility: 'Increased visibility in search results',
      benefitTrust: 'More trust from other users',
      benefitSupport: 'Priority support',
      whyTitle: 'Why get a Riyadah badge?',
      whyMessage: 'The Riyadah badge is a mark of authenticity. It shows that your account is verified and is the real deal, helping you stand out and be trusted.',
      verificationBenefits: 'Benefits of verification',
      benefitCredibility: 'Build credibility and trust',
      benefitEngagement: 'Higher visibility and engagement',
      benefitDistinguish: 'Distinguish yourself from other or fake accounts',
      benefitExclusive: 'Access to exclusive features (coming soon)',
      statsTitle: 'Accounts with the Riyadah badge have:',
      statSponsors: 'Higher chance of attracting sponsors and partnerships',
      statScouts: 'More visibility and priority with scouts and recruiters',
      statSearch: 'More likely to be discovered in search results',
      faq: 'FAQ',
      faqWhy: 'Why should I buy the Riyadah badge?',
      faqWhyAnswer: 'A Riyadah badge gives you instant credibility, helps you stand out, and proves your account is authentic and trusted by sponsors, scouts, and the community.',
      faqDuration: 'How long does it last?',
      faqDurationAnswer: 'The badge is permanent and stays with your account as long as you follow our community guidelines.',
      faqLose: 'Can I lose my badge?',
      faqLoseAnswer: 'Yes. If your account engages in suspicious, misleading, or fraudulent activity, the badge may be revoked.',
      ctaTitle: 'Get verified today',
      oneTimePurchase: 'One-time purchase - only $9.99',
      comingSoon: 'Coming soon',
    },
    placesTest: {
      searchPlaceholder: 'Search location...',
      selected: 'Selected:',
      latitude: 'Lat',
      longitude: 'Lng',
    },
    staffForm: {
      backToStaff: 'Back to staff',
      newStaff: 'New Staff',
      addStaffDesc: 'Add a staff member for your club',
      searchSection: 'Check for Existing Account',
      searchPlaceholder: 'Search by name or email (min. 3 characters)',
      addAsStaff: 'Add as staff',
      cantFind: "Can't find the account you are looking for?",
      createWithoutAccountHint: "Don't worry you can still create a new staff by clicking on the button below.",
      addWithoutAccount: 'Add new staff without account',
      noResults: 'No results.',
      noResultsHint: 'Looks like the staff you are looking for does not have an account on Riyadah.',
      selectedUser: 'Selected user',
      retrySearch: 'Tap here to retry search',
      retrySearchHint: 'Search for an existing account and skip basic information',
      basicInfo: 'Basic Information',
      professionalInfo: 'Professional Information',
      name: 'Name *',
      enterStaffName: 'Enter staff name',
      email: 'Email *',
      enterEmail: 'Enter email address',
      loginHint: 'This will be used to login',
      role: 'Role *',
      assignedTeams: 'Assigned Teams',
      noTeams: 'No teams available',
      employmentType: 'Employment Type',
      salaryPerMonth: 'Salary (per month)',
      salaryAmount: 'Salary amount',
      qualifications: 'Qualifications',
      addQualification: 'Add qualification',
      certifications: 'Certifications',
      addCertification: 'Add certification',
      add: 'Add',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      cancel: 'Cancel',
      saving: 'Saving',
      save: 'Save',
      fillRequired: 'Please fill in all required fields',
      failedLoadTeams: 'Failed to load teams',
      failedSearchUsers: 'Failed to search users',
      failedCreate: 'Failed to create staff',
      coach: 'Coach',
      manager: 'Manager',
      boardMember: 'Board Member',
      medicalStaff: 'Medical Staff',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      contract: 'Contract',
      volunteer: 'Volunteer',
      ghost: 'Staff',
      successTitle: 'Staff account created successfully',
      emailPrefix: 'Email: {email}',
      copied: 'Copied',
      copy: 'Copy',
      share: 'Share',
      credentialsHint: 'You can screenshot these credentials or copy/paste them to your staff in order to login to their account.\nYou will not be able to see these info again.',
      addAnother: 'Add another staff',
      backToList: 'Go back to staff list',
      tapToChangeImage: 'Tap to change image',
      tapToUploadImage: 'Tap to upload new image',
    },
    account: {
      back: 'Back',
      accountSettings: 'Account settings',
      changePassword: 'Change password',
      forgotPassword: 'Forgot password',
      resetPasswordDesc: "Reset your account's password",
      forgotGhost: 'Forgo',
      accountGhost: 'Accou',
      passwordGhost: 'Pass',
      emailAddress: 'Email address',
      phoneNumber: 'Phone number',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      nothingChanged: 'Nothing changed',
      emailUpdateFailed: 'Something went wrong during email update',
      phoneUpdateFailed: 'Something went wrong during phone update',
      failedUpdatePhone: 'Failed to update phone',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      password: 'Password',
      currentPasswordRequired: 'Please enter your current password',
      currentPasswordWrong: 'Current password is wrong',
      genericError: 'Something went wrong.',
      passwordsMismatch: 'Passwords do not match',
      passwordSameAsOld: 'New password cannot be the same as the old one',
      passwordTooShort: 'Password must be at least 6 characters',
      next: 'Next',
      checking: 'Checking',
      checkEmail: 'Check email',
      verifyEmail: 'Verify email',
      noAccountFound: 'No account found',
      validEmailRequired: 'Please enter a valid email address',
      failedSendOtp: 'Failed to send email OTP',
      otpSentHint: 'Enter the 6-digit code sent to your email.',
      resendCode: 'Resend code',
      resetPassword: 'Reset password',
      verifyAndContinue: 'Verify and continue',
      copied: 'Copied',
      emailOtpFailed: 'Failed to send email OTP',
      phoneOtpFailed: 'Failed to send phone OTP',
      sendingOtp: 'Sending OTP',
      sendOtp: 'Send OTP',
      verifying: 'Verifying',
      verify: 'Verify',
      getNewCode: 'Get a new code OTP',
      verifyAccount: 'Verify account',
      verifyAccountDesc: 'Verify your email address and phone number',
      verifyGhost: 'Verify',
      verified: 'Verified',
      emailAddressLabel: 'Email address',
      phoneNumberLabel: 'Phone number',
    },
    profileEditor: {
      editProfile: 'Edit profile',
      changeYourData: 'Change your data',
      editGhost: 'Edit',
      uploadAvatar: 'Upload avatar',
      changeAvatar: 'Change avatar',
      childrenCount: 'Children ({count})',
      addChild: 'Add child',
      noChildrenYet: 'No children added yet',
      admin: 'Admin',
      contactInfo: 'Contact Info',
      hiddenEmptyFields: 'Empty fields will be hidden from your profile',
      description: 'Description',
      openingHours: 'Opening hours',
      phoneNumber: 'Phone number',
      email: 'Email',
      facebookUsername: 'Facebook username',
      instagramUsername: 'Instagram username',
      whatsappNumber: 'Whatsapp number',
      telegramUsername: 'Telegram username',
      tiktokUsername: 'Tiktok username',
      snapchatUsername: 'Snapchat username',
      location: 'Location',
      useCurrentLocation: 'Use My Current Location',
      mapHint: 'Pinch to zoom, tap to pin location',
      summary: 'Summary',
      bio: 'Bio',
      aboutClub: 'About the club',
      aboutAssociation: 'About the association',
      aboutYou: 'About you',
      country: 'Country',
      establishmentDate: 'Establishment date',
      dateOfBirth: 'Date of Birth',
      position: 'Position',
      positionPlaceholder: 'Position you play eg.: Goal keeper',
      height: 'Height',
      heightPlaceholder: 'In cm',
      weight: 'Weight',
      weightPlaceholder: 'In Kg',
      achievements: 'Achievements',
      achievementsPlaceholder: 'What are your biggest achievements?',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      invalidDate: 'Please enter a valid date',
      futureDate: 'Date cannot be in the future',
      addChildrenTitle: 'Add Children',
      addChildrenDesc: 'Search for an athlete to add as your child',
      childrenGhost: 'Childr',
      search: 'Search',
      searchAthletePlaceholder: 'Athlete name or email (min. 3 characters)',
      alreadyChild: 'Already a child',
      addAsChild: '+ Add As Child',
      noResultsChild: "No results.\nCan't find your child's account?",
      createNewAccount: 'Create a New Account',
      childAlreadyAdded: '{name} is already added as a child',
      childAccount: 'Child Account',
      childAccountDesc: 'Turn your child into a real Riyadah athlete',
      childName: 'Child name',
      childEmail: 'Child email',
      loginHint: 'This will be used to login',
      pleaseFillNameEmail: 'Please fill name and email',
      childCreateFailed: 'Something went wrong. Please try again later.',
      childCreated: 'Child account created successfully',
      copy: 'Copy',
      copied: 'Copied',
      share: 'Share',
      childCredentialsHint: 'You can screenshot these credentials or copy/paste them to your child in order to login to their account.\nYou will not be able to see these info again.',
      addAnotherChild: 'Add another child',
      continueEditing: 'continue editing your profile',
      uploadLogo: 'Upload logo',
      uploadAvatarTitle: 'Upload Avatar',
      changeLogo: 'Change your logo',
      changeProfilePicture: 'Change your profile picture',
      logoGhost: 'Logo',
      avatarGhost: 'Avata',
      imageTooLarge: 'Image size too large {size} MB. Max 5 MB',
      removingBackground: 'Removing background...',
      tapChangeImage: 'Tap to change image',
      tapUploadImage: 'Tap to upload new image',
      saveLower: 'save',
      savingLower: 'saving',
    },
    createPost: {
      placeholder: "What's on your mind?",
      photoVideo: 'Photo/Video',
      post: 'Post',
      posting: 'Posting',
      mediaPermission: 'Permission to access media library is required!',
    },
    inventory: {
      backToInventory: 'Back to inventory',
      newItem: 'New inventory item',
      newItemDesc: "Add a new item to your club's inventory",
      ghost: 'Invento',
      itemName: 'Item name',
      enterItemName: 'Enter item name',
      category: 'Category',
      quantity: 'Quantity',
      enterQuantity: 'Enter quantity',
      unitPrice: 'Unit price',
      amount: 'Amount',
      description: 'Description',
      enterDescription: 'Enter description',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      validationTitle: 'Validation',
      errorTitle: 'Error',
      userRequired: 'User ID is required.',
      requiredFields: 'Item name and category are required.',
      failedCreate: 'Failed to create inventory item',
      genericCreateError: 'An error occurred. Please try again.',
      detailsTitle: 'Inventory item details',
      noItem: 'No item found.',
      image: 'Image',
      availableQuantity: 'Available quantity',
      noDescription: 'No description',
      equipment: 'Equipment',
      uniform: 'Uniform',
      accessories: 'Accessories',
      medicalSupplies: 'Medical supplies',
    },
    teamCreate: {
      backToTeams: 'Back to teams',
      newTeam: 'New Team',
      newTeamDesc: 'Create a new team in your club',
      ghost: 'Teams',
      teamLogo: 'Team logo',
      tapChangeImage: 'Tap to change image',
      tapUploadImage: 'Tap to upload new image',
      teamName: 'Team name',
      enterTeamName: 'Enter team name',
      coaches: 'Coaches',
      noCoachesAvailable: 'No coaches available.',
      sport: 'Sport',
      ageGroup: 'Age group',
      gender: 'Gender',
      addAgeGroup: 'Add age group',
      newAgeGroup: 'New age group',
      ageGroupRequired: 'Age group is required',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      teamNameRequired: 'Team name is required',
      selectSport: 'Please select a sport',
      imageTooLarge: 'Image too large. Max 2MB',
      mediaPermission: 'Permission to access media library is required!',
      failedPickImage: 'Failed to pick image',
      errorTitle: 'Error',
      failedCreate: 'Failed to create team',
    },
    teamSchedule: {
      backToTeams: 'Back to teams',
      title: 'Team Events',
      desc: 'Manage upcoming events',
      ghost: 'Events',
      upcomingEvents: 'Upcoming events',
      noEvents: 'No events',
      onlineEvent: 'Online event',
      locationTbd: 'Location TBD',
      versus: 'vs {name}',
    },
    timesheet: {
      backToStaff: 'Back to staff',
      title: 'Timesheet',
      ghost: 'TimeS',
      noStaff: 'No staff member found.',
      history: 'History',
      noRecords: 'No timesheet records yet.',
      locationMatch: 'Location match',
      locationMismatch: 'Location does not match',
      in: 'In',
      out: 'Out',
      notCheckedOut: 'Not checked out yet',
      defaultStaffName: 'Staff Member',
      failedLoad: 'Failed to load staff details',
      errorTitle: 'Error',
    },
    coachSurvey: {
      backToSurveys: 'Back to surveys',
      title: 'Survey details',
      ghost: 'Surv',
      filters: 'Filters',
      clear: 'Clear',
      userId: 'User ID',
      filterUserId: 'Filter by user ID',
      from: 'From (YYYY-MM-DD)',
      to: 'To (YYYY-MM-DD)',
      applyFilters: 'Apply filters',
      submissions: 'Submissions',
      noSubmissions: 'No submissions found.',
      unknownUser: 'Unknown user',
      question: 'Question',
      userNotAuthenticated: 'User not authenticated',
      failedSurvey: 'Failed to load survey',
      failedResponses: 'Failed to load submissions',
      submissionCount: '{count} submission{suffix}',
      dataHintFrom: '2025-01-01',
      dataHintTo: '2025-01-31',
    },
    manager: {
      dashboard: 'Manager dashboard',
      logout: 'Logout',
      quickLinks: 'Quick links',
      performanceTests: 'Athletes Performance Tests',
      surveyManager: 'Survey Manager',
      sportsManager: 'Sports Manager',
      manualNotifications: 'Manual Notifications',
      addBulkAthletes: 'Add Bulk New Athletes',
      addAthlete: 'Add New Athlete',
      back: 'Back',
      bulkAthletes: 'Bulk Athletes',
      bulkAthletesDesc: 'Upload Excel sheets to create accounts',
      template: 'Template',
      downloadTemplate: 'Download Excel Template',
      templateHint: 'Columns: Name, Email, Phone, Gender, Sport, Club Name, Club Email, Country.',
      newBulkUpload: 'New Bulk Upload',
      processing: 'Processing...',
      uploadExcel: 'Upload Excel File',
      preview: 'Preview',
      errors: 'Errors',
      missingName: 'Missing name',
      missingEmail: 'Missing email',
      creating: 'Creating...',
      submitBulk: 'Submit Bulk Creation',
      result: 'Result',
      totalRows: 'Total rows: {count}',
      created: 'Created: {count}',
      failed: 'Failed: {count}',
      createdUsers: 'Created users',
      history: 'History',
      noBulkUploads: 'No bulk uploads yet.',
      notifications: 'Notifications',
      target: 'Target',
      notification: 'Notification',
      searchByNameOrEmail: 'Search by name or email',
      useTemplate: 'Use template',
      randomTest: 'Random test',
      random: 'Random',
      title: 'Title',
      body: 'Body',
      dataJson: 'Data (JSON)',
      notificationTitlePlaceholder: 'Notification title',
      notificationBodyPlaceholder: 'Notification message',
      sendNotification: 'Send notification',
      sendingNotification: 'Sending...',
      selectTarget: 'Select a target.',
      selectAtLeastOneUser: 'Select at least one user.',
      selectSport: 'Select a sport.',
      invalidJson: 'Data must be valid JSON.',
      failedSearch: 'Failed to search',
      failedSendNotifications: 'Failed to send notifications',
      sentNotifications: 'Sent {sent}/{total} notifications.',
      searchPlaceholder: 'Search by name or email',
      selectSportPlaceholder: 'Select a sport',
      sportsDesc: 'Create, edit, and manage sports',
      addNewSport: 'Add New Sport',
      sportName: 'Sport name',
      uploadIcon: 'Upload Icon',
      createSport: 'Create Sport',
      allSports: 'All Sports',
      noSportsFound: 'No sports found.',
      visible: 'Visible',
      hidden: 'Hidden',
      save: 'Save',
      edit: 'Edit',
      hide: 'Hide',
      show: 'Show',
      icon: 'Icon',
      delete: 'Delete',
      failedLoadSports: 'Failed to load sports',
      sportNameRequired: 'Sport name is required',
      failedCreateSport: 'Failed to create sport',
      failedUpdateSport: 'Failed to update sport',
      failedUpdateVisibility: 'Failed to update visibility',
      deleteSportTitle: 'Delete sport',
      deleteSportMessage: 'Are you sure you want to delete this sport?',
      failedDeleteSport: 'Failed to delete sport',
      failedUploadIcon: 'Failed to upload icon',
      permissionRequired: 'Permission required',
      allowPhotos: 'Please allow access to your photos.',
    },
    managerAthlete: {
      back: 'Back',
      newAthlete: 'New Athlete',
      addAthleteDesc: 'Add an athlete account',
      basicInfo: 'Basic Information',
      athleteInfo: 'Athlete Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      gender: 'Gender',
      sport: 'Sport',
      club: 'Club',
      enterAthleteName: 'Enter athlete name',
      enterEmail: 'Enter email address',
      loginHint: 'This will be used to login',
      enterPhone: 'Enter phone number',
      selectGender: 'Select gender',
      selectSport: 'Select sport',
      searchClub: 'Search by club name (min. 3 characters)',
      remove: 'Remove',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving',
      requiredFields: 'Please fill in all required fields',
      failedCreate: 'Failed to create athlete',
      created: 'Athlete account created successfully',
      copy: 'Copy',
      copied: 'Copied',
      share: 'Share',
      credentialsHint: 'You can screenshot these credentials or copy/paste them to your athlete in order to login to their account.\nYou will not be able to see these info again.',
      addAnother: 'Add another athlete',
      backToDashboard: 'Go back to dashboard',
      emailLabel: 'Email: {email}',
    },
    managerSurvey: {
      title: 'Survey Manager',
      editSurvey: 'Edit Survey',
      createSurvey: 'Create Survey',
      newSurvey: 'New survey',
      surveyTitle: 'Survey title',
      setActive: 'Set as active survey',
      repeatingSurvey: 'Repeating survey',
      restriction: 'Restriction',
      searchRestriction: 'Search {scope} (min 3 characters)',
      searchScope: 'Search {scope}',
      selectedRestriction: 'Selected: {label}',
      clear: 'Clear',
      questions: 'Questions',
      addQuestion: 'Add question',
      question: 'Question {index}',
      questionText: 'Question text',
      helperText: 'Helper text (optional)',
      questionType: 'Question type',
      required: 'Required',
      conditionalDisplay: 'Conditional display',
      alwaysShow: 'Always show',
      conditionalAnswer: 'Show if answer is (comma separated)',
      conditionalHint: 'Save the survey to enable conditional logic for new questions.',
      options: 'Options',
      addOption: 'Add option',
      option: 'Option {index}',
      scaleSettings: 'Scale settings',
      min: 'Min',
      max: 'Max',
      step: 'Step',
      create: 'Create survey',
      update: 'Update survey',
      existingSurveys: 'Existing surveys',
      noSurveys: 'No surveys created yet.',
      active: 'Active',
      submissions: 'Submissions',
      preview: 'Preview',
      delete: 'Delete',
      userNotAuthenticated: 'User not authenticated',
      failedLoad: 'Failed to load surveys',
      titleRequired: 'Survey title is required.',
      cadenceRequired: 'Repeating cadence is required.',
      restrictionRequired: 'Restriction selection is required.',
      questionsNeedText: 'All questions need text.',
      choicesNeedOption: 'Choice questions need at least one option.',
      failedSave: 'Failed to save survey',
      deleteTitle: 'Delete survey',
      deleteMessage: 'Are you sure you want to delete this survey?',
      failedDelete: 'Failed to delete survey',
      failedSearch: 'Failed to search',
      questionsCount: '{count} questions',
    },
    skillsTesting: {
      testedSubject: 'Tested subject',
      searchPlaceholder: 'Search (Min. 3 characters)',
      noToken: 'No token found',
      selectedUserNotAthlete: 'Selected user is not an athlete.',
      backToSearch: 'Back to search',
      selectedUser: 'Selected user',
      lastUpdated: 'Last updated: {date}',
      addNewResult: 'Add new result',
      cancel: 'Cancel',
      newTestResults: 'New Test Results',
      skill: 'Skill',
      score: 'Score',
      addAnotherSkill: '+ Add Another Skill',
      submitting: 'Submitting...',
      submitResults: 'Submit Results',
      noSkills: 'No skills tested yet.',
      noUserData: 'No test data found for this user.',
    },
    createPost: {
      placeholder: 'بماذا تفكر؟',
      photoVideo: 'صورة/فيديو',
      post: 'نشر',
      posting: 'جارٍ النشر',
      mediaPermission: 'يلزم السماح بالوصول إلى مكتبة الوسائط.',
    },
    inventory: {
      backToInventory: 'العودة إلى المخزون',
      newItem: 'عنصر مخزون جديد',
      newItemDesc: 'أضف عنصرًا جديدًا إلى مخزون ناديك',
      ghost: 'مخزو',
      itemName: 'اسم العنصر',
      enterItemName: 'أدخل اسم العنصر',
      category: 'الفئة',
      quantity: 'الكمية',
      enterQuantity: 'أدخل الكمية',
      unitPrice: 'سعر الوحدة',
      amount: 'المبلغ',
      description: 'الوصف',
      enterDescription: 'أدخل الوصف',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ',
      validationTitle: 'التحقق',
      errorTitle: 'خطأ',
      userRequired: 'معرّف المستخدم مطلوب.',
      requiredFields: 'اسم العنصر والفئة مطلوبان.',
      failedCreate: 'فشل إنشاء عنصر المخزون',
      genericCreateError: 'حدث خطأ. حاول مرة أخرى.',
      detailsTitle: 'تفاصيل عنصر المخزون',
      noItem: 'لم يتم العثور على عنصر.',
      image: 'الصورة',
      availableQuantity: 'الكمية المتاحة',
      noDescription: 'لا يوجد وصف',
      equipment: 'معدات',
      uniform: 'زي',
      accessories: 'إكسسوارات',
      medicalSupplies: 'مستلزمات طبية',
    },
    teamCreate: {
      backToTeams: 'العودة إلى الفرق',
      newTeam: 'فريق جديد',
      newTeamDesc: 'أنشئ فريقًا جديدًا في ناديك',
      ghost: 'فرق',
      teamLogo: 'شعار الفريق',
      tapChangeImage: 'اضغط لتغيير الصورة',
      tapUploadImage: 'اضغط لرفع صورة جديدة',
      teamName: 'اسم الفريق',
      enterTeamName: 'أدخل اسم الفريق',
      coaches: 'المدربون',
      noCoachesAvailable: 'لا يوجد مدربون متاحون.',
      sport: 'الرياضة',
      ageGroup: 'الفئة العمرية',
      gender: 'الجنس',
      addAgeGroup: 'إضافة فئة عمرية',
      newAgeGroup: 'فئة عمرية جديدة',
      ageGroupRequired: 'الفئة العمرية مطلوبة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ',
      teamNameRequired: 'اسم الفريق مطلوب',
      selectSport: 'يرجى اختيار رياضة',
      imageTooLarge: 'الصورة كبيرة جدًا. الحد الأقصى 2MB',
      mediaPermission: 'يلزم السماح بالوصول إلى مكتبة الوسائط.',
      failedPickImage: 'فشل اختيار الصورة',
      errorTitle: 'خطأ',
      failedCreate: 'فشل إنشاء الفريق',
    },
    teamSchedule: {
      backToTeams: 'العودة إلى الفرق',
      title: 'فعاليات الفريق',
      desc: 'إدارة الفعاليات القادمة',
      ghost: 'أحدا',
      upcomingEvents: 'الفعاليات القادمة',
      noEvents: 'لا توجد فعاليات',
      onlineEvent: 'فعالية عبر الإنترنت',
      locationTbd: 'سيتم تحديد الموقع لاحقًا',
      versus: 'ضد {name}',
    },
    timesheet: {
      backToStaff: 'العودة إلى الموظفين',
      title: 'سجل الدوام',
      ghost: 'دوام',
      noStaff: 'لم يتم العثور على موظف.',
      history: 'السجل',
      noRecords: 'لا توجد سجلات دوام بعد.',
      locationMatch: 'الموقع مطابق',
      locationMismatch: 'الموقع غير مطابق',
      in: 'دخول',
      out: 'خروج',
      notCheckedOut: 'لم يتم تسجيل الخروج بعد',
      defaultStaffName: 'موظف',
      failedLoad: 'فشل تحميل تفاصيل الموظف',
      errorTitle: 'خطأ',
    },
    coachSurvey: {
      backToSurveys: 'العودة إلى الاستبيانات',
      title: 'تفاصيل الاستبيان',
      ghost: 'استب',
      filters: 'الفلاتر',
      clear: 'مسح',
      userId: 'معرّف المستخدم',
      filterUserId: 'تصفية حسب معرّف المستخدم',
      from: 'من (YYYY-MM-DD)',
      to: 'إلى (YYYY-MM-DD)',
      applyFilters: 'تطبيق الفلاتر',
      submissions: 'الردود',
      noSubmissions: 'لم يتم العثور على ردود.',
      unknownUser: 'مستخدم غير معروف',
      question: 'السؤال',
      userNotAuthenticated: 'المستخدم غير مسجّل الدخول',
      failedSurvey: 'فشل تحميل الاستبيان',
      failedResponses: 'فشل تحميل الردود',
      submissionCount: '{count} رد{suffix}',
      dataHintFrom: '2025-01-01',
      dataHintTo: '2025-01-31',
    },
    manager: {
      dashboard: 'لوحة المدير',
      logout: 'تسجيل الخروج',
      quickLinks: 'روابط سريعة',
      performanceTests: 'اختبارات أداء الرياضيين',
      surveyManager: 'إدارة الاستبيانات',
      sportsManager: 'إدارة الرياضات',
      manualNotifications: 'الإشعارات اليدوية',
      addBulkAthletes: 'إضافة رياضيين دفعة واحدة',
      addAthlete: 'إضافة رياضي جديد',
      back: 'رجوع',
      bulkAthletes: 'الرياضيون بالجملة',
      bulkAthletesDesc: 'ارفع ملفات إكسل لإنشاء الحسابات',
      template: 'القالب',
      downloadTemplate: 'تنزيل قالب إكسل',
      templateHint: 'الأعمدة: الاسم، البريد الإلكتروني، الهاتف، الجنس، الرياضة، اسم النادي، بريد النادي، الدولة.',
      newBulkUpload: 'رفع جماعي جديد',
      processing: 'جارٍ المعالجة...',
      uploadExcel: 'رفع ملف إكسل',
      preview: 'معاينة',
      errors: 'الأخطاء',
      missingName: 'الاسم مفقود',
      missingEmail: 'البريد الإلكتروني مفقود',
      creating: 'جارٍ الإنشاء...',
      submitBulk: 'تنفيذ الإنشاء الجماعي',
      result: 'النتيجة',
      totalRows: 'إجمالي الصفوف: {count}',
      created: 'تم الإنشاء: {count}',
      failed: 'فشل: {count}',
      createdUsers: 'المستخدمون الذين تم إنشاؤهم',
      history: 'السجل',
      noBulkUploads: 'لا توجد عمليات رفع جماعية بعد.',
      notifications: 'الإشعارات',
      target: 'الهدف',
      notification: 'الإشعار',
      searchByNameOrEmail: 'ابحث بالاسم أو البريد الإلكتروني',
      useTemplate: 'استخدام القالب',
      randomTest: 'اختبار عشوائي',
      random: 'عشوائي',
      title: 'العنوان',
      body: 'النص',
      dataJson: 'البيانات (JSON)',
      notificationTitlePlaceholder: 'عنوان الإشعار',
      notificationBodyPlaceholder: 'رسالة الإشعار',
      sendNotification: 'إرسال الإشعار',
      sendingNotification: 'جارٍ الإرسال...',
      selectTarget: 'اختر هدفًا.',
      selectAtLeastOneUser: 'اختر مستخدمًا واحدًا على الأقل.',
      selectSport: 'اختر رياضة.',
      invalidJson: 'يجب أن تكون البيانات JSON صالحًا.',
      failedSearch: 'فشل البحث',
      failedSendNotifications: 'فشل إرسال الإشعارات',
      sentNotifications: 'تم إرسال {sent}/{total} إشعار.',
      searchPlaceholder: 'ابحث بالاسم أو البريد الإلكتروني',
      selectSportPlaceholder: 'اختر رياضة',
      sportsDesc: 'إنشاء الرياضات وتعديلها وإدارتها',
      addNewSport: 'إضافة رياضة جديدة',
      sportName: 'اسم الرياضة',
      uploadIcon: 'رفع أيقونة',
      createSport: 'إنشاء رياضة',
      allSports: 'كل الرياضات',
      noSportsFound: 'لم يتم العثور على رياضات.',
      visible: 'مرئي',
      hidden: 'مخفي',
      save: 'حفظ',
      edit: 'تعديل',
      hide: 'إخفاء',
      show: 'إظهار',
      icon: 'أيقونة',
      delete: 'حذف',
      failedLoadSports: 'فشل تحميل الرياضات',
      sportNameRequired: 'اسم الرياضة مطلوب',
      failedCreateSport: 'فشل إنشاء الرياضة',
      failedUpdateSport: 'فشل تحديث الرياضة',
      failedUpdateVisibility: 'فشل تحديث الظهور',
      deleteSportTitle: 'حذف الرياضة',
      deleteSportMessage: 'هل أنت متأكد أنك تريد حذف هذه الرياضة؟',
      failedDeleteSport: 'فشل حذف الرياضة',
      failedUploadIcon: 'فشل رفع الأيقونة',
      permissionRequired: 'الإذن مطلوب',
      allowPhotos: 'يرجى السماح بالوصول إلى صورك.',
    },
    managerAthlete: {
      back: 'رجوع',
      newAthlete: 'رياضي جديد',
      addAthleteDesc: 'إضافة حساب رياضي',
      basicInfo: 'المعلومات الأساسية',
      athleteInfo: 'معلومات الرياضي',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      gender: 'الجنس',
      sport: 'الرياضة',
      club: 'النادي',
      enterAthleteName: 'أدخل اسم الرياضي',
      enterEmail: 'أدخل البريد الإلكتروني',
      loginHint: 'سيتم استخدام هذا لتسجيل الدخول',
      enterPhone: 'أدخل رقم الهاتف',
      selectGender: 'اختر الجنس',
      selectSport: 'اختر الرياضة',
      searchClub: 'ابحث باسم النادي (3 أحرف على الأقل)',
      remove: 'إزالة',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ',
      requiredFields: 'يرجى تعبئة جميع الحقول المطلوبة',
      failedCreate: 'فشل إنشاء الرياضي',
      created: 'تم إنشاء حساب الرياضي بنجاح',
      copy: 'نسخ',
      copied: 'تم النسخ',
      share: 'مشاركة',
      credentialsHint: 'يمكنك أخذ لقطة شاشة لهذه البيانات أو نسخها وإرسالها إلى الرياضي لتسجيل الدخول إلى حسابه.\nلن تتمكن من رؤية هذه المعلومات مرة أخرى.',
      addAnother: 'إضافة رياضي آخر',
      backToDashboard: 'العودة إلى لوحة المدير',
      emailLabel: 'البريد الإلكتروني: {email}',
    },
    managerSurvey: {
      title: 'إدارة الاستبيانات',
      editSurvey: 'تعديل الاستبيان',
      createSurvey: 'إنشاء استبيان',
      newSurvey: 'استبيان جديد',
      surveyTitle: 'عنوان الاستبيان',
      setActive: 'تعيين كاستبيان نشط',
      repeatingSurvey: 'استبيان متكرر',
      restriction: 'التقييد',
      searchRestriction: 'ابحث عن {scope} (3 أحرف على الأقل)',
      searchScope: 'ابحث عن {scope}',
      selectedRestriction: 'المحدد: {label}',
      clear: 'مسح',
      questions: 'الأسئلة',
      addQuestion: 'إضافة سؤال',
      question: 'السؤال {index}',
      questionText: 'نص السؤال',
      helperText: 'نص مساعد (اختياري)',
      questionType: 'نوع السؤال',
      required: 'مطلوب',
      conditionalDisplay: 'عرض شرطي',
      alwaysShow: 'إظهار دائمًا',
      conditionalAnswer: 'أظهر إذا كانت الإجابة (مفصولة بفواصل)',
      conditionalHint: 'احفظ الاستبيان لتفعيل المنطق الشرطي للأسئلة الجديدة.',
      options: 'الخيارات',
      addOption: 'إضافة خيار',
      option: 'الخيار {index}',
      scaleSettings: 'إعدادات المقياس',
      min: 'الحد الأدنى',
      max: 'الحد الأقصى',
      step: 'الخطوة',
      create: 'إنشاء استبيان',
      update: 'تحديث الاستبيان',
      existingSurveys: 'الاستبيانات الحالية',
      noSurveys: 'لا توجد استبيانات بعد.',
      active: 'نشط',
      submissions: 'الردود',
      preview: 'معاينة',
      delete: 'حذف',
      userNotAuthenticated: 'المستخدم غير مسجّل الدخول',
      failedLoad: 'فشل تحميل الاستبيانات',
      titleRequired: 'عنوان الاستبيان مطلوب.',
      cadenceRequired: 'نوع التكرار مطلوب.',
      restrictionRequired: 'اختيار التقييد مطلوب.',
      questionsNeedText: 'كل الأسئلة تحتاج إلى نص.',
      choicesNeedOption: 'أسئلة الاختيار تحتاج إلى خيار واحد على الأقل.',
      failedSave: 'فشل حفظ الاستبيان',
      deleteTitle: 'حذف الاستبيان',
      deleteMessage: 'هل أنت متأكد أنك تريد حذف هذا الاستبيان؟',
      failedDelete: 'فشل حذف الاستبيان',
      failedSearch: 'فشل البحث',
      questionsCount: '{count} أسئلة',
    },
    skillsTesting: {
      testedSubject: 'موضوع الاختبار',
      searchPlaceholder: 'بحث (3 أحرف على الأقل)',
      noToken: 'لا يوجد رمز دخول',
      selectedUserNotAthlete: 'المستخدم المحدد ليس رياضيًا.',
      backToSearch: 'العودة إلى البحث',
      selectedUser: 'المستخدم المحدد',
      lastUpdated: 'آخر تحديث: {date}',
      addNewResult: 'إضافة نتيجة جديدة',
      cancel: 'إلغاء',
      newTestResults: 'نتائج اختبار جديدة',
      skill: 'المهارة',
      score: 'النتيجة',
      addAnotherSkill: '+ إضافة مهارة أخرى',
      submitting: 'جارٍ الإرسال...',
      submitResults: 'إرسال النتائج',
      noSkills: 'لا توجد مهارات مختبرة بعد.',
      noUserData: 'لا توجد بيانات اختبار لهذا المستخدم.',
    },
    staffDetails: {
      backToStaff: 'Back to staff',
      title: 'Staff details',
      ghost: 'Staff',
      noStaff: 'No staff member found.',
      failedLoad: 'Failed to load staff details',
      defaultRole: 'Staff Member',
      contactInfo: 'Contact info',
      noTeamsAssigned: 'No teams assigned',
      qualifications: 'Qualifications',
      certifications: 'Certifications',
      none: 'None',
      employment: 'Employment',
      type: 'Type',
      salary: 'Salary',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      notAvailable: 'N/A',
    },
    landing: {
      comments: 'Comments',
      noComments: 'No comments yet',
      newPost: 'New Post',
      whatsOnYourMind: "What's on your mind?",
      photoVideo: 'Photo/Video',
      cancel: 'Cancel',
      post: 'Post',
      posting: 'Posting',
      noPosts: 'No posts yet',
      writeComment: 'Write a comment...',
      yourProfile: 'Go to your profile',
      userProfile: "Go to {name}'s profile",
      deletePost: 'Delete post',
      areYouSure: 'Are you sure?',
      yesDelete: 'Yes, delete',
      no: 'No',
    },
    profile: {
      defaultTitle: 'Profile',
      profile: 'Profile',
      teams: 'Teams',
      schedule: 'Schedule',
      staff: 'Staff',
      inventory: 'Inventory',
      financials: 'Financials',
      surveys: 'Surveys',
      timesheet: 'Timesheet',
      performance: 'Performance',
      clubs: 'Clubs',
      contact: 'Contact',
      addContactInfo: '+Add contact info',
      noContactInfo: 'No contact info',
      bio: 'Bio',
      summary: 'Summary',
      interestedIn: 'Interested in',
      sport: 'Sport',
      sports: 'Sports',
      country: 'Country',
      playsIn: 'Plays in',
      team: 'team',
      teamsCount: 'teams',
      coachOf: 'Coach of',
      club: 'Club',
      independent: 'Independent',
      organization: 'Organization',
      totalSports: 'Total number of sports',
      totalTeams: 'Total number of teams',
      totalMembers: 'Total number of members',
      established: 'Established',
      dateOfBirth: 'Date of Birth',
      uploadLogo: 'Upload logo',
      uploadAvatar: 'Upload avatar',
      changeLogo: 'Change logo',
      changeAvatar: 'Change avatar',
      completeProfile: 'Complete your profile now',
      getDirections: 'Get Directions',
      comingSoon: 'Coming soon',
      financialsSoon: "Don't worry! We will notify you when Financials page is available",
      history: 'History',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      noTimesheetRecords: 'No timesheet records yet.',
      locationMatch: 'Location match',
      locationMismatch: 'Location does not match',
      in: 'In',
      out: 'Out',
      notCheckedOut: 'Not checked out yet',
      noDataYet: 'No data yet',
      lastTestDate: 'Last Test Date',
      overallAveragePerformance: 'Overall Average Performance',
      lastUpdated: 'Last updated',
      nothingToShow: 'Nothing to show',
      achievements: 'Achievements',
      childrenAchievements: "Children's Achievements",
      upcomingEvents: 'Upcoming Events',
      childrenUpcomingEvents: "Children's Upcoming Events",
      editProfile: 'Edit profile',
      shareProfile: 'Share Profile',
      clubTeams: 'Club Teams',
      addTeam: '+ Add Team',
      noTeamsYet: 'No Teams Yet',
      createFirstTeam: 'Create your first team to get started',
      noClubTeamsYet: "This club hasn't created any teams yet",
      createTeam: 'Create Team',
      associationClubsCount: '{count} Association club{suffix}',
      manage: 'Manage',
      cancelPlain: 'Cancel',
      searchClubsPlaceholder: 'search clubs (min. 3 characters)',
      alreadyAdded: 'Already added',
      add: '+ Add',
      noResults: 'No results',
      noClubsYet: 'No Clubs Yet',
      addClubs: 'Add Clubs',
      noSurveys: 'No Surveys',
      noActiveSurveys: 'No active surveys are available right now.',
      clubStaff: 'Club Staff',
      addStaff: '+ Add Staff',
      noStaffMembers: 'No Staff Members',
      addFirstStaff: 'Add your first staff member to get started',
      noClubStaffYet: "This club hasn't added any staff members yet",
      addStaffButton: 'Add Staff',
      call: 'Call',
      email: 'Email',
      timesheetButton: 'TimeSheet',
      clubInventory: 'Club Inventory',
      addItem: '+ Add Item',
      inStock: 'In Stock',
      unitPrice: 'Unit Price:',
      description: 'Description:',
      noItems: 'No Items',
      addFirstInventory: 'Add your first inventory item to get started',
      noClubInventoryYet: "This club hasn't added any inventory items yet",
      addItemButton: 'Add Item',
      members: 'Members',
      coach: 'Coach',
      coaches: 'Coaches',
      checkProfile: 'Check profile',
      admin: 'Admin',
      sendDm: 'Send DM',
      highlights: 'Highlights',
      childrenHighlights: "Children's Highlights",
      stats: 'Stats',
      childrenStats: "Children's Stats",
      height: 'Height',
      weight: 'Weight',
      sure: 'Sure?',
      yes: 'Yes',
      noShort: 'No',
      clubSchedule: 'Club Schedule',
      yourTeamsSchedule: 'Your teams Schedule',
      addEvent: '+ Add Event',
      eventsOfDay: 'Events of the day',
      cancelled: 'Cancelled',
      noEventsToday: 'No events for this day.',
      noUpcomingEvents: 'No upcoming events.',
      noScheduledEvents: 'No Scheduled Events',
      createEvent: 'Create Event',
      balance: 'Balance',
      availableBalance: 'Available Balance',
      topUp: 'Top Up',
      sendMoney: 'Send money',
      amount: 'Amount',
      timesheetInfo: 'This will use your current location to check you into your club. Please note that your timesheet will be accessed and used by the HR department of your club.',
      onlineEvent: 'Online Event',
      locationTbd: 'Location TBD',
      versus: 'vs',
    },
  },
  ar: {
    common: {
      english: 'الإنجليزية',
      arabic: 'العربية',
      loading: 'جارٍ التحميل...',
      verified: 'موثق',
      pending: 'قيد الانتظار',
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'إعدادات الحساب',
      accountSettings: 'إعدادات الحساب',
      changePassword: 'تغيير كلمة المرور',
      badge: 'شارة رياضة',
      verification: 'توثيق الحساب',
      language: 'اللغة',
      languageHint: 'غيّر لغة التطبيق واتجاه الواجهة.',
      terms: 'الشروط والأحكام',
      privacy: 'سياسة الخصوصية',
      website: 'زيارة موقع رياضة',
      deactivate: 'تعطيل الحساب',
      logout: 'تسجيل الخروج',
      ghost: 'إعداد',
    },
    surveyRespond: {
      titleFallback: 'الاستبيان',
      back: 'رجوع',
      previewMode: 'وضع المعاينة',
      userNotAuthenticated: 'المستخدم غير مسجل الدخول',
      failedToLoad: 'فشل تحميل الاستبيان',
      unavailableTitle: 'الاستبيان غير متاح',
      unavailableMessage: 'لم يتم العثور على استبيان لإرساله.',
      sessionRequiredTitle: 'الجلسة مطلوبة',
      sessionRequiredMessage: 'هذا الاستبيان متاح فقط بعد جلسة تدريب.',
      requiredFieldsTitle: 'يرجى تعبئة جميع الحقول المطلوبة',
      requiredFieldsMessage: 'جميع الحقول المطلوبة إلزامية.',
      failedToSubmit: 'فشل إرسال الاستبيان',
      errorTitle: 'خطأ',
      failedToSubmitMessage: 'فشل إرسال الاستبيان.',
      afterTrainingHint: 'هذا الاستبيان متاح بعد جلسة تدريب.',
      typeYourResponse: 'اكتب إجابتك',
      answer: 'الإجابة',
      submitting: 'جارٍ الإرسال',
      submit: 'إرسال',
      submittedSuccessfully: 'تم إرسال الاستبيان بنجاح!',
    },
    auth: {
      back: 'رجوع',
      loginTitle: 'تسجيل الدخول',
      loginSubtitle: 'لنبدأ الآن!',
      needAccount: 'تحتاج إلى حساب جديد؟',
      registerHere: 'سجل هنا',
      loginHere: 'سجل الدخول هنا',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      next: 'التالي',
      loggingIn: 'جارٍ تسجيل الدخول',
      login: 'تسجيل الدخول',
      pleaseFillEmailPassword: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
      loginFailed: 'فشل تسجيل الدخول. حاول مرة أخرى',
      pleaseEnterEmail: 'يرجى إدخال البريد الإلكتروني',
      emailCheckFailed: 'فشل التحقق من البريد الإلكتروني. حاول مرة أخرى',
      createAccountTitle: 'أنشئ حسابك',
      continueAccountTitle: 'تابع إنشاء حسابك',
      createAccountSubtitle: 'انضم إلى الحماس وتواصل مع الرياضيين مثلك!',
      name: 'الاسم',
      phoneNumber: 'رقم الهاتف',
      passwordHint: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل وتحتوي على حرف كبير ورمز واحد',
      agreePrefix: 'أوافق على ',
      termsAndConditions: 'الشروط والأحكام',
      creating: 'جارٍ الإنشاء',
      create: 'إنشاء',
      account: 'حساب',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      disclaimer: 'بإنشاء حساب واستخدامه على رياضة، فأنت توافق على الشروط والأحكام وسياسة الخصوصية الخاصة برياضة.',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      invalidPhone: 'رقم الهاتف غير صالح',
      passwordMin: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      fillAllFields: 'يرجى تعبئة جميع الحقول والموافقة على الشروط',
    },
    search: {
      placeholder: 'بحث (3 أحرف على الأقل)',
      filters: 'الفلاتر',
      searchByPosition: 'البحث حسب المركز',
      enterPosition: 'أدخل المركز',
      searchIn: 'البحث في',
      searchFor: 'البحث عن',
      gender: 'الجنس',
      sport: 'الرياضة',
      filter: 'تصفية',
      athletes: 'اللاعبون',
      athlete: 'لاعب',
      clubs: 'الأندية',
      club: 'نادي',
      federations: 'الاتحادات',
      federation: 'اتحاد',
      coaches: 'المدربون',
      coach: 'مدرب',
      all: 'الكل',
      users: 'المستخدمون',
      teams: 'الفرق',
      events: 'الفعاليات',
      posts: 'المنشورات',
      football: 'كرة القدم',
      basketball: 'كرة السلة',
      tennis: 'التنس',
      swimming: 'السباحة',
      gymnastics: 'الجمباز',
      male: 'ذكر',
      female: 'أنثى',
    },
    notifications: {
      title: 'الإشعارات',
      ghost: 'إشعار',
      unreadSingle: 'لديك إشعار واحد غير مقروء',
      unreadPlural: 'لديك {count} إشعارات غير مقروءة',
      empty: 'لا توجد إشعارات',
      markAllRead: 'تحديد الكل كمقروء',
      markRead: 'تحديد كمقروء',
      delete: 'حذف',
      now: 'الآن',
      minutesAgo: 'منذ {count} د',
      hoursAgo: 'منذ {count} س',
    },
    messages: {
      title: 'الرسائل',
      noChats: 'لا توجد محادثات بعد',
      deleteChat: 'حذف المحادثة',
      areYouSure: 'هل أنت متأكد؟',
      yesDelete: 'نعم، احذف',
      no: 'لا',
      cancel: 'إلغاء',
      newMessage: 'رسالة جديدة',
      searchUsers: 'ابحث عن مستخدمين',
      noUsersYet: 'لا يوجد مستخدمون بعد',
      noUsersFound: 'لم يتم العثور على مستخدمين',
      unknownUser: 'مستخدم غير معروف',
      noMessages: 'لا توجد رسائل بعد',
      errorTitle: 'خطأ',
      selectUser: 'يرجى اختيار مستخدم',
      failedCreateChat: 'فشل إنشاء المحادثة',
      somethingWentWrong: 'حدث خطأ ما',
      now: 'الآن',
      minutesAgo: 'منذ {count} د',
      hoursAgo: 'منذ {count} س',
    },
    chat: {
      back: 'رجوع',
      termsDisclaimer: 'باستخدام الدردشة عبر تطبيق رياضة، فإنك توافق على الشروط والأحكام وسياسة الخصوصية',
      typeMessage: 'اكتب رسالة...',
      failedLoad: 'فشل تحميل المحادثة',
      failedSend: 'فشل إرسال الرسالة',
    },
    home: {
      headline: 'ضع أهدافك،\nاسحقها،\nوأعدها.',
      subtext: 'تواصل وتنافس وازدهر مع الرياضيين والجماهير في مدينتك وخارجها.',
      login: 'تسجيل الدخول',
      createAccount: 'إنشاء حساب',
    },
    attendance: {
      title: 'كشف الحضور',
      ghost: 'حضور',
      failedFetch: 'فشل جلب بيانات الحضور',
      failedConnect: 'فشل الاتصال بالخادم',
      lockedTitle: 'تم قفل الحضور',
      lockedMessage: 'لم يعد بالإمكان تعديل الحضور.',
      failedSubmit: 'فشل إرسال الحضور',
      failedSubmitConnection: 'فشل إرسال الحضور. يرجى التحقق من اتصالك.',
      editingClosesIn: 'يغلق التعديل خلال {time}',
      whoAttended: 'من حضر؟',
      selectedHint: 'الرياضيون المحددون هم الذين كانوا حاضرين.',
      submitLocked: 'تم قفل الحضور',
      submitting: 'جارٍ الإرسال',
      submit: 'إرسال كشف الحضور',
      submitted: 'تم إرسال كشف الحضور بنجاح!',
    },
    teamDetails: {
      backToTeams: 'العودة إلى الفرق',
      title: 'تفاصيل الفريق',
      uploadLogo: 'رفع الشعار',
      changeLogo: 'تغيير الشعار',
      ageGroup: 'الفئة العمرية',
      gender: 'الجنس',
      noCoaches: 'لا يوجد مدربون',
      noMembers: 'لا يوجد أعضاء',
      noEvents: 'لا توجد فعاليات',
      upcomingEvents: 'الفعاليات القادمة',
      coachCount: '{count} مدرب{suffix}',
      memberCount: '{count} عضو{suffix}',
    },
    teamManage: {
      back: 'رجوع',
      coachesTitle: 'مدربو الفريق',
      coachesDesc: 'إدارة مدربي {name}',
      coachesGhost: 'مدربين',
      membersTitle: 'أعضاء الفريق',
      membersDesc: 'إدارة أعضاء {name}',
      membersGhost: 'أعضاء',
      edit: 'تعديل',
      done: 'تم',
      addCoachPlaceholder: 'أضف مدربًا بالاسم أو البريد الإلكتروني (3 أحرف على الأقل)',
      addMemberPlaceholder: 'أضف رياضيين بالاسم أو البريد الإلكتروني (3 أحرف على الأقل)',
      noSport: 'لا توجد رياضة',
      alreadyCoach: 'مدرب بالفعل',
      addAsCoach: '+ أضف كمدرب',
      alreadyMember: 'عضو بالفعل',
      addAsMember: '+ أضف كعضو',
      noResults: 'لا توجد نتائج',
      sure: 'متأكد؟',
      yes: 'نعم',
      no: 'لا',
      authMissing: 'رمز التحقق مفقود',
      failedAddCoach: 'فشل إضافة المدرب.',
      failedAddMember: 'فشل إضافة العضو.',
      addCoachError: 'حدث خطأ أثناء إضافة المدرب.',
      addMemberError: 'حدث خطأ أثناء إضافة العضو.',
      removeCoachError: 'خطأ أثناء إزالة المدرب',
      removeMemberError: 'خطأ أثناء إزالة العضو',
    },
    scheduleDetails: {
      back: 'رجوع',
      title: 'تفاصيل الفعالية',
      ghost: 'فعالية',
      noEvent: 'لم يتم العثور على فعالية.',
      failedLoad: 'فشل تحميل تفاصيل الفعالية',
      recurringTitle: 'فعالية متكررة',
      recurringMessage: 'هل تريد إلغاء هذه المرة فقط أم جميع المرات القادمة؟',
      thisEventOnly: 'هذه الفعالية فقط',
      allOccurrences: 'كل المرات',
      cancel: 'إلغاء',
      confirmCancel: 'تأكيد الإلغاء',
      confirmCancelAll: 'هل أنت متأكد أنك تريد إلغاء كل المرات القادمة؟',
      confirmCancelOne: 'هل أنت متأكد أنك تريد إلغاء هذه الفعالية؟',
      no: 'لا',
      yesCancel: 'نعم، إلغاء',
      failedCancel: 'فشل إلغاء الفعالية',
      cancelEvent: 'إلغاء الفعالية',
      edit: 'تعديل',
      attendance: 'الحضور',
      eventTitle: 'العنوان',
      description: 'الوصف',
      noDescription: 'لا يوجد وصف',
      date: 'التاريخ',
      from: 'من',
      till: 'إلى',
      location: 'الموقع',
      scheduled: 'مجدولة',
      cancelled: 'ملغاة',
    },
    scheduleForm: {
      backToSchedule: 'العودة إلى الجدول',
      newEventTitle: 'فعالية جديدة',
      newEventDesc: 'أنشئ فعالية لناديك',
      editEventTitle: 'تعديل الفعالية',
      editEventDesc: 'تحديث فعالية موجودة',
      ghost: 'فعاليات',
      eventTitle: 'عنوان الفعالية *',
      enterEventTitle: 'أدخل عنوان الفعالية',
      date: 'التاريخ*',
      from: 'من*',
      till: 'إلى*',
      eventType: 'نوع الفعالية *',
      team: 'الفريق *',
      description: 'الوصف',
      enterDescription: 'أدخل الوصف',
      recurringEvent: 'فعالية متكررة',
      recurringHint: 'ستنتهي المدة التكرارية تلقائيًا بعد سنة واحدة.',
      locationType: 'نوع الموقع',
      venueName: 'اسم المكان',
      enterVenueName: 'أدخل اسم المكان',
      venueAddress: 'عنوان المكان',
      enterVenueAddress: 'أدخل عنوان المكان',
      onlineMeetingLink: 'رابط الاجتماع عبر الإنترنت',
      enterMeetingLink: 'أدخل رابط الاجتماع',
      venueLocation: 'موقع المكان',
      searchLocation: 'ابحث عن موقع...',
      trainingFocus: 'تركيز التدريب',
      trainingFocusPlaceholder: 'مثال: تمارين تمرير، تمركز دفاعي',
      requiredEquipment: 'المعدات المطلوبة',
      searchEquipment: 'ابحث عن معدات (3 أحرف على الأقل)',
      available: 'المتوفر: {count}',
      noEquipmentResults: 'لا توجد نتائج. جرّب كلمة أخرى',
      add: 'إضافة',
      opponentName: 'اسم الخصم',
      enterOpponentName: 'أدخل اسم فريق الخصم',
      opponentLogoUrl: 'رابط شعار الخصم',
      enterOpponentLogoUrl: 'أدخل رابط شعار الخصم',
      homeOrAway: 'داخل الأرض أو خارجها',
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ',
      save: 'حفظ',
      editing: 'جارٍ التعديل',
      edit: 'تعديل',
      fillRequired: 'يرجى تعبئة جميع الحقول المطلوبة',
      endTimeAfterStart: 'يجب أن يكون وقت النهاية بعد وقت البداية',
      failedCreate: 'فشل إنشاء الفعالية',
      failedLoad: 'فشل تحميل الفعالية',
      failedUpdate: 'فشل تحديث الفعالية',
      recurringEditTitle: 'فعالية متكررة',
      recurringEditMessage: 'هل تريد تعديل هذه المرة فقط أم جميع المرات القادمة؟',
      thisEventOnly: 'هذه الفعالية فقط',
      allOccurrences: 'كل المرات',
      no: 'لا',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      yearly: 'سنوي',
      trainingSession: 'حصة تدريبية',
      training: 'تدريب',
      match: 'مباراة',
      meeting: 'اجتماع',
      tournament: 'بطولة',
      venue: 'مكان',
      online: 'عبر الإنترنت',
      toBeDetermined: 'يحدد لاحقًا',
      homeGame: 'على أرضنا',
      awayGame: 'خارج أرضنا',
    },
    payments: {
      backToFinancials: 'العودة إلى الشؤون المالية',
      newPayment: 'دفعة جديدة',
      createPaymentDesc: 'أنشئ دفعة جديدة لناديك',
      paymentDetails: 'تفاصيل الدفعة',
      selectBeneficiary: 'اختر المستفيد',
      searchBeneficiary: 'ابحث بالاسم أو البريد الإلكتروني (3 أحرف على الأقل)',
      select: 'اختر',
      noResults: 'لا توجد نتائج.',
      noResultsHint: 'يبدو أن المستخدم الذي تبحث عنه لا يملك حساباً على رياضة.',
      selectedUser: 'المستخدم المحدد',
      amount: 'المبلغ',
      amountPlaceholder: 'مثال: 50',
      paymentType: 'نوع الدفعة',
      registrationFees: 'رسوم تسجيل النادي',
      monthlyFees: 'رسوم الاشتراك الشهرية',
      equipmentPurchase: 'شراء معدات',
      salary: 'راتب',
      other: 'أخرى',
      specifyPaymentType: 'حدّد نوع الدفعة',
      note: 'ملاحظة',
      notePlaceholder: 'تعليق أو ملاحظة...',
      cancel: 'إلغاء',
      paying: 'جارٍ الدفع',
      pay: 'ادفع',
      userNotAuthenticated: 'المستخدم غير مسجل الدخول',
      failedSearchUsers: 'فشل البحث عن المستخدمين',
      failedSave: 'فشل حفظ الدفعة',
      unexpectedSave: 'حدث خطأ ما. حاول مرة أخرى.',
      authMissing: 'رمز التوثيق مفقود',
      failedFetch: 'فشل جلب تفاصيل الدفعة',
      failedFetchGeneric: 'حدث خطأ أثناء جلب الدفعة',
      failedSettle: 'فشل تسوية الدفعة',
      errorSettling: 'خطأ أثناء تسوية الدفعة',
      type: 'النوع',
      date: 'التاريخ',
      status: 'الحالة',
      payer: 'الدافع',
      beneficiary: 'المستفيد',
      pending: 'قيد الانتظار',
      completed: 'مكتملة',
      declined: 'مرفوضة',
      paymentNumber: 'الدفعة رقم {id}',
    },
    wizard: {
      accountType: 'نوع الحساب',
      whatAreYou: 'من أنت؟',
      next: 'التالي',
      selectAccountType: 'يرجى اختيار نوع الحساب',
      parent: 'ولي أمر',
      athlete: 'لاعب',
      club: 'نادي/أكاديمية',
      association: 'اتحاد/رابطة',
      scout: 'كشاف',
      sponsor: 'راعٍ',
      ghost: 'accou',
      dobTitle: 'تاريخ الميلاد',
      dobDesc: 'متى وُلدت؟',
      establishedTitle: 'تاريخ التأسيس',
      establishedDescClub: 'متى تأسس النادي؟',
      establishedDescAssociation: 'متى تأسست الجمعية؟',
      dobGhost: 'DOB',
      sinceGhost: 'SINCE',
      dayRequired: 'اليوم مطلوب',
      monthRequired: 'الشهر مطلوب',
      yearRequired: 'السنة مطلوبة',
      invalidDate: 'يرجى إدخال تاريخ صحيح',
      numbersOnlyDate: 'يرجى إدخال أرقام فقط لليوم والشهر والسنة',
      monthRange: 'يجب أن يكون الشهر بين 01 و12',
      dayRange: 'يجب أن يكون اليوم بين 01 و{maxDay} للشهر المحدد',
      futureDate: 'لا يمكن أن يكون التاريخ في المستقبل',
      parentUnder18: 'لا يمكن أن يكون ولي الأمر أقل من 18 عاماً',
      scoutUnder18: 'لا يمكن أن يكون الكشاف أقل من 18 عاماً',
      sponsorUnder18: 'لا يمكن أن يكون الراعي أقل من 18 عاماً',
      fillAllFields: 'يرجى تعبئة جميع الحقول',
      parentEmailHint: 'بما أنك أقل من 18 عاماً، يرجى إدخال البريد الإلكتروني لولي أمرك.',
      parentEmail: 'بريد ولي الأمر',
      gender: 'الجنس',
      admin: 'المشرف',
      adminName: 'اسم المشرف',
      adminEmail: 'بريد المشرف الإلكتروني',
      adminHint: 'سيتحقق النظام مما إذا كان للمشرف حساب على رياضة',
      summary: 'الملخص',
      bio: 'نبذة',
      describeYourself: 'عرّف بنفسك',
      describeClub: 'صف النادي',
      describeAssociation: 'صف الجمعية',
      creatingAccount: 'جارٍ إنشاء الحساب',
      aboutClub: 'عن النادي',
      aboutYou: 'عنك',
      tellUsMoreClub: 'أخبرنا المزيد عن ناديك',
      tellUsMoreYou: 'أخبرنا المزيد عنك',
      sorryInconvenience: 'نعتذر عن الإزعاج',
      tryAgain: 'حاول مرة أخرى',
      genderRequired: 'يرجى اختيار الجنس',
      adminNameRequired: 'يرجى إدخال اسم المشرف',
      adminEmailRequired: 'يرجى إدخال بريد المشرف الإلكتروني',
      registrationError: 'حدث خطأ ما. حاول مرة أخرى.',
      sportType: 'نوع الرياضة',
      organization: 'الجهة',
      whatDoYouDo: 'ماذا تمارس؟',
      organizationQuestion: 'ما الجهة التي تعمل لديها؟',
      sportGhost: 'Sport',
      organizationGhost: 'Organi',
      noOrganization: 'ليس لدي جهة. أنا مستقل',
      organizationName: 'اسم الجهة',
      organizationLocation: 'موقع الجهة',
      organizationRole: 'دورك في الجهة',
      organizationSince: 'في أي سنة بدأت العمل هنا؟',
      sportsInterested: 'ما الرياضات التي تهتم بها؟',
      noSportsAvailable: 'لا توجد رياضات متاحة.',
      selectSportType: 'يرجى اختيار نوع الرياضة',
      addClubs: 'إضافة أندية',
      selectClub: 'اختر ناديك',
      associationClubsQuestion: 'ما الأندية التي تندرج تحت جمعيتك؟',
      athleteClubQuestion: 'ما النادي الذي تلعب معه؟',
      clubsGhost: 'Clubs',
      clubGhost: 'Club',
      noClubIndependent: 'ليس لدي نادٍ. أنا مستقل',
      athleteIndependentHint: 'افتراضياً، يتم تسجيل جميع الرياضيين كمستقلين.',
      athleteClubContactHint: 'إذا كنت عضواً في نادٍ، يرجى التواصل مع ناديك عبر رياضة لطلب إضافتك.',
      searchClubs: 'ابحث عن الأندية (3 أحرف على الأقل)',
      noClubsFound: 'لم يتم العثور على أندية لـ "{keyword}"',
      selectClubRequired: 'يرجى اختيار نادٍ',
    },
    notFound: {
      title: 'عفوًا!',
      message: 'هذه الشاشة غير موجودة.',
      goHome: 'اذهب إلى الصفحة الرئيسية!',
    },
    badge: {
      back: 'رجوع',
      title: 'شارة رياضة',
      ghost: 'badge',
      congratulations: 'مبروك!',
      verifiedMessage: 'حسابك موثّق رسميًا بشارة رياضة. هذا يساعدك على التميّز، وبناء الثقة، وإظهار الموثوقية داخل مجتمعنا.',
      benefitsTitle: 'مزاياك:',
      benefitVisibility: 'ظهور أكبر في نتائج البحث',
      benefitTrust: 'ثقة أكبر من المستخدمين الآخرين',
      benefitSupport: 'دعم ذو أولوية',
      whyTitle: 'لماذا تحصل على شارة رياضة؟',
      whyMessage: 'شارة رياضة علامة على الموثوقية. تُظهر أن حسابك موثّق وحقيقي، مما يساعدك على التميز وكسب الثقة.',
      verificationBenefits: 'مزايا التوثيق',
      benefitCredibility: 'بناء المصداقية والثقة',
      benefitEngagement: 'ظهور وتفاعل أعلى',
      benefitDistinguish: 'تمييز نفسك عن الحسابات الأخرى أو المزيفة',
      benefitExclusive: 'الوصول إلى ميزات حصرية (قريبًا)',
      statsTitle: 'الحسابات التي تحمل شارة رياضة لديها:',
      statSponsors: 'فرصة أعلى لجذب الرعاة والشراكات',
      statScouts: 'ظهور وأولوية أكبر لدى الكشافين والمستقطبين',
      statSearch: 'احتمال أكبر للظهور في نتائج البحث',
      faq: 'الأسئلة الشائعة',
      faqWhy: 'لماذا يجب أن أشتري شارة رياضة؟',
      faqWhyAnswer: 'شارة رياضة تمنحك مصداقية فورية، وتساعدك على التميز، وتثبت أن حسابك موثوق ومعتمد لدى الرعاة والكشافين والمجتمع.',
      faqDuration: 'كم تدوم؟',
      faqDurationAnswer: 'الشارة دائمة وتبقى مع حسابك طالما التزمت بإرشادات المجتمع.',
      faqLose: 'هل يمكن أن أفقد الشارة؟',
      faqLoseAnswer: 'نعم. إذا انخرط حسابك في نشاط مشبوه أو مضلل أو احتيالي، فقد يتم سحب الشارة.',
      ctaTitle: 'احصل على التوثيق اليوم',
      oneTimePurchase: 'شراء لمرة واحدة فقط - 9.99 دولار',
      comingSoon: 'قريبًا',
    },
    placesTest: {
      searchPlaceholder: 'ابحث عن موقع...',
      selected: 'المحدد:',
      latitude: 'خط العرض',
      longitude: 'خط الطول',
    },
    staffForm: {
      backToStaff: 'العودة إلى الطاقم',
      newStaff: 'طاقم جديد',
      addStaffDesc: 'أضف عضواً جديداً إلى طاقم ناديك',
      searchSection: 'تحقق من وجود حساب حالي',
      searchPlaceholder: 'ابحث بالاسم أو البريد الإلكتروني (3 أحرف على الأقل)',
      addAsStaff: 'أضفه إلى الطاقم',
      cantFind: 'ألا تجد الحساب الذي تبحث عنه؟',
      createWithoutAccountHint: 'لا تقلق، ما زال بإمكانك إنشاء عضو طاقم جديد من الزر أدناه.',
      addWithoutAccount: 'أضف طاقماً جديداً بدون حساب',
      noResults: 'لا توجد نتائج.',
      noResultsHint: 'يبدو أن عضو الطاقم الذي تبحث عنه لا يملك حساباً على رياضة.',
      selectedUser: 'المستخدم المحدد',
      retrySearch: 'اضغط هنا لإعادة البحث',
      retrySearchHint: 'ابحث عن حساب موجود وتجاوز المعلومات الأساسية',
      basicInfo: 'المعلومات الأساسية',
      professionalInfo: 'المعلومات المهنية',
      name: 'الاسم *',
      enterStaffName: 'أدخل اسم عضو الطاقم',
      email: 'البريد الإلكتروني *',
      enterEmail: 'أدخل البريد الإلكتروني',
      loginHint: 'سيُستخدم هذا لتسجيل الدخول',
      role: 'الدور *',
      assignedTeams: 'الفرق المعيّنة',
      noTeams: 'لا توجد فرق متاحة',
      employmentType: 'نوع التوظيف',
      salaryPerMonth: 'الراتب الشهري',
      salaryAmount: 'قيمة الراتب',
      qualifications: 'المؤهلات',
      addQualification: 'أضف مؤهلاً',
      certifications: 'الشهادات',
      addCertification: 'أضف شهادة',
      add: 'إضافة',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      cancel: 'إلغاء',
      saving: 'جارٍ الحفظ',
      save: 'حفظ',
      fillRequired: 'يرجى تعبئة جميع الحقول المطلوبة',
      failedLoadTeams: 'فشل تحميل الفرق',
      failedSearchUsers: 'فشل البحث عن المستخدمين',
      failedCreate: 'فشل إنشاء عضو الطاقم',
      coach: 'مدرب',
      manager: 'مدير',
      boardMember: 'عضو مجلس إدارة',
      medicalStaff: 'طاقم طبي',
      fullTime: 'دوام كامل',
      partTime: 'دوام جزئي',
      contract: 'عقد',
      volunteer: 'متطوع',
      ghost: 'Staff',
      successTitle: 'تم إنشاء حساب الطاقم بنجاح',
      emailPrefix: 'البريد الإلكتروني: {email}',
      copied: 'تم النسخ',
      copy: 'نسخ',
      share: 'مشاركة',
      credentialsHint: 'يمكنك أخذ لقطة شاشة لهذه البيانات أو نسخها وإرسالها إلى عضو الطاقم لتسجيل الدخول إلى حسابه.\nلن تتمكن من رؤية هذه المعلومات مرة أخرى.',
      addAnother: 'أضف عضواً آخر',
      backToList: 'العودة إلى قائمة الطاقم',
      tapToChangeImage: 'اضغط لتغيير الصورة',
      tapToUploadImage: 'اضغط لرفع صورة جديدة',
    },
    account: {
      back: 'رجوع',
      accountSettings: 'إعدادات الحساب',
      changePassword: 'تغيير كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور',
      resetPasswordDesc: 'أعد تعيين كلمة مرور حسابك',
      forgotGhost: 'Forgo',
      accountGhost: 'Accou',
      passwordGhost: 'Pass',
      emailAddress: 'البريد الإلكتروني',
      phoneNumber: 'رقم الهاتف',
      invalidEmail: 'بريد إلكتروني غير صالح',
      invalidPhone: 'رقم هاتف غير صالح',
      nothingChanged: 'لم يتغير شيء',
      emailUpdateFailed: 'حدث خطأ أثناء تحديث البريد الإلكتروني',
      phoneUpdateFailed: 'حدث خطأ أثناء تحديث الهاتف',
      failedUpdatePhone: 'فشل تحديث الهاتف',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور الجديدة',
      password: 'كلمة المرور',
      currentPasswordRequired: 'يرجى إدخال كلمة المرور الحالية',
      currentPasswordWrong: 'كلمة المرور الحالية غير صحيحة',
      genericError: 'حدث خطأ ما.',
      passwordsMismatch: 'كلمتا المرور غير متطابقتين',
      passwordSameAsOld: 'لا يمكن أن تكون كلمة المرور الجديدة نفسها القديمة',
      passwordTooShort: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      next: 'التالي',
      checking: 'جارٍ التحقق',
      checkEmail: 'تحقق من البريد',
      verifyEmail: 'تحقق من البريد',
      noAccountFound: 'لم يتم العثور على حساب',
      validEmailRequired: 'يرجى إدخال بريد إلكتروني صالح',
      failedSendOtp: 'فشل إرسال رمز التحقق إلى البريد الإلكتروني',
      otpSentHint: 'أدخل الرمز المكوّن من 6 أرقام المرسل إلى بريدك الإلكتروني.',
      resendCode: 'إعادة إرسال الرمز',
      resetPassword: 'إعادة تعيين كلمة المرور',
      verifyAndContinue: 'تحقق وتابع',
      copied: 'تم النسخ',
      emailOtpFailed: 'فشل إرسال رمز التحقق إلى البريد الإلكتروني',
      phoneOtpFailed: 'فشل إرسال رمز التحقق إلى الهاتف',
      sendingOtp: 'جارٍ إرسال الرمز',
      sendOtp: 'إرسال الرمز',
      verifying: 'جارٍ التحقق',
      verify: 'تحقق',
      getNewCode: 'احصل على رمز جديد',
      verifyAccount: 'تحقق من الحساب',
      verifyAccountDesc: 'تحقق من بريدك الإلكتروني ورقم هاتفك',
      verifyGhost: 'Verify',
      verified: 'تم التحقق',
      emailAddressLabel: 'عنوان البريد الإلكتروني',
      phoneNumberLabel: 'رقم الهاتف',
    },
    profileEditor: {
      editProfile: 'تعديل الملف الشخصي',
      changeYourData: 'غيّر بياناتك',
      editGhost: 'Edit',
      uploadAvatar: 'رفع الصورة الشخصية',
      changeAvatar: 'تغيير الصورة الشخصية',
      childrenCount: 'الأطفال ({count})',
      addChild: 'إضافة طفل',
      noChildrenYet: 'لم تتم إضافة أطفال بعد',
      admin: 'المشرف',
      contactInfo: 'معلومات التواصل',
      hiddenEmptyFields: 'سيتم إخفاء الحقول الفارغة من ملفك الشخصي',
      description: 'الوصف',
      openingHours: 'ساعات العمل',
      phoneNumber: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      facebookUsername: 'اسم مستخدم فيسبوك',
      instagramUsername: 'اسم مستخدم إنستغرام',
      whatsappNumber: 'رقم واتساب',
      telegramUsername: 'اسم مستخدم تيليغرام',
      tiktokUsername: 'اسم مستخدم تيك توك',
      snapchatUsername: 'اسم مستخدم سناب شات',
      location: 'الموقع',
      useCurrentLocation: 'استخدم موقعي الحالي',
      mapHint: 'قرّب للتكبير واضغط لتثبيت الموقع',
      summary: 'الملخص',
      bio: 'النبذة',
      aboutClub: 'عن النادي',
      aboutAssociation: 'عن الجمعية',
      aboutYou: 'عنك',
      country: 'الدولة',
      establishmentDate: 'تاريخ التأسيس',
      dateOfBirth: 'تاريخ الميلاد',
      position: 'المركز',
      positionPlaceholder: 'المركز الذي تلعب فيه، مثل: حارس مرمى',
      height: 'الطول',
      heightPlaceholder: 'بالسنتيمتر',
      weight: 'الوزن',
      weightPlaceholder: 'بالكيلوغرام',
      achievements: 'الإنجازات',
      achievementsPlaceholder: 'ما هي أكبر إنجازاتك؟',
      cancel: 'إلغاء',
      save: 'حفظ',
      saving: 'جارٍ الحفظ',
      invalidDate: 'يرجى إدخال تاريخ صحيح',
      futureDate: 'لا يمكن أن يكون التاريخ في المستقبل',
      addChildrenTitle: 'إضافة أطفال',
      addChildrenDesc: 'ابحث عن لاعب لإضافته كطفلك',
      childrenGhost: 'Childr',
      search: 'بحث',
      searchAthletePlaceholder: 'اسم اللاعب أو بريده الإلكتروني (3 أحرف على الأقل)',
      alreadyChild: 'مضاف كطفل',
      addAsChild: '+ أضف كطفل',
      noResultsChild: 'لا توجد نتائج.\nألا تجد حساب طفلك؟',
      createNewAccount: 'إنشاء حساب جديد',
      childAlreadyAdded: '{name} مضاف بالفعل كطفل',
      childAccount: 'حساب طفل',
      childAccountDesc: 'حوّل طفلك إلى لاعب رياضة حقيقي',
      childName: 'اسم الطفل',
      childEmail: 'بريد الطفل الإلكتروني',
      loginHint: 'سيُستخدم هذا لتسجيل الدخول',
      pleaseFillNameEmail: 'يرجى تعبئة الاسم والبريد الإلكتروني',
      childCreateFailed: 'حدث خطأ ما. حاول مرة أخرى لاحقاً.',
      childCreated: 'تم إنشاء حساب الطفل بنجاح',
      copy: 'نسخ',
      copied: 'تم النسخ',
      share: 'مشاركة',
      childCredentialsHint: 'يمكنك أخذ لقطة شاشة لهذه البيانات أو نسخها وإرسالها لطفلك لتسجيل الدخول إلى حسابه.\nلن تتمكن من رؤية هذه المعلومات مرة أخرى.',
      addAnotherChild: 'أضف طفلاً آخر',
      continueEditing: 'تابع تعديل ملفك الشخصي',
      uploadLogo: 'رفع الشعار',
      uploadAvatarTitle: 'رفع الصورة الشخصية',
      changeLogo: 'غيّر شعارك',
      changeProfilePicture: 'غيّر صورتك الشخصية',
      logoGhost: 'Logo',
      avatarGhost: 'Avata',
      imageTooLarge: 'حجم الصورة كبير جداً {size} م.ب. الحد الأقصى 5 م.ب',
      removingBackground: 'جارٍ إزالة الخلفية...',
      tapChangeImage: 'اضغط لتغيير الصورة',
      tapUploadImage: 'اضغط لرفع صورة جديدة',
      saveLower: 'حفظ',
      savingLower: 'جارٍ الحفظ',
    },
    staffDetails: {
      backToStaff: 'العودة إلى الطاقم',
      title: 'تفاصيل الطاقم',
      ghost: 'طاقم',
      noStaff: 'لم يتم العثور على عضو طاقم.',
      failedLoad: 'فشل تحميل تفاصيل الطاقم',
      defaultRole: 'عضو طاقم',
      contactInfo: 'معلومات التواصل',
      noTeamsAssigned: 'لا توجد فرق مخصصة',
      qualifications: 'المؤهلات',
      certifications: 'الشهادات',
      none: 'لا يوجد',
      employment: 'التوظيف',
      type: 'النوع',
      salary: 'الراتب',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      notAvailable: 'غير متوفر',
    },
    landing: {
      comments: 'التعليقات',
      noComments: 'لا توجد تعليقات بعد',
      newPost: 'منشور جديد',
      whatsOnYourMind: 'بماذا تفكر؟',
      photoVideo: 'صورة/فيديو',
      cancel: 'إلغاء',
      post: 'نشر',
      posting: 'جارٍ النشر',
      noPosts: 'لا توجد منشورات بعد',
      writeComment: 'اكتب تعليقًا...',
      yourProfile: 'اذهب إلى ملفك الشخصي',
      userProfile: 'اذهب إلى ملف {name} الشخصي',
      deletePost: 'حذف المنشور',
      areYouSure: 'هل أنت متأكد؟',
      yesDelete: 'نعم، احذف',
      no: 'لا',
    },
    profile: {
      defaultTitle: 'الملف الشخصي',
      profile: 'الملف الشخصي',
      teams: 'الفرق',
      schedule: 'الجدول',
      staff: 'الطاقم',
      inventory: 'المخزون',
      financials: 'المالية',
      surveys: 'الاستبيانات',
      timesheet: 'سجل الدوام',
      performance: 'الأداء',
      clubs: 'الأندية',
      contact: 'التواصل',
      addContactInfo: '+إضافة معلومات التواصل',
      noContactInfo: 'لا توجد معلومات تواصل',
      bio: 'نبذة',
      summary: 'الملخص',
      interestedIn: 'مهتم بـ',
      sport: 'الرياضة',
      sports: 'الرياضات',
      country: 'الدولة',
      playsIn: 'يلعب في',
      team: 'فريق',
      teamsCount: 'فرق',
      coachOf: 'يدرب',
      club: 'النادي',
      independent: 'مستقل',
      organization: 'المنظمة',
      totalSports: 'إجمالي عدد الرياضات',
      totalTeams: 'إجمالي عدد الفرق',
      totalMembers: 'إجمالي عدد الأعضاء',
      established: 'تاريخ التأسيس',
      dateOfBirth: 'تاريخ الميلاد',
      uploadLogo: 'رفع الشعار',
      uploadAvatar: 'رفع الصورة',
      changeLogo: 'تغيير الشعار',
      changeAvatar: 'تغيير الصورة',
      completeProfile: 'أكمل ملفك الشخصي الآن',
      getDirections: 'الحصول على الاتجاهات',
      comingSoon: 'قريبًا',
      financialsSoon: 'لا تقلق، سنبلغك عند توفر صفحة المالية',
      history: 'السجل',
      checkIn: 'تسجيل الدخول',
      checkOut: 'تسجيل الخروج',
      noTimesheetRecords: 'لا توجد سجلات دوام بعد.',
      locationMatch: 'الموقع مطابق',
      locationMismatch: 'الموقع غير مطابق',
      in: 'دخول',
      out: 'خروج',
      notCheckedOut: 'لم يتم تسجيل الخروج بعد',
      noDataYet: 'لا توجد بيانات بعد',
      lastTestDate: 'آخر تاريخ اختبار',
      overallAveragePerformance: 'متوسط الأداء العام',
      lastUpdated: 'آخر تحديث',
      nothingToShow: 'لا يوجد ما يمكن عرضه',
      achievements: 'الإنجازات',
      childrenAchievements: 'إنجازات الأطفال',
      upcomingEvents: 'الفعاليات القادمة',
      childrenUpcomingEvents: 'فعاليات الأطفال القادمة',
      editProfile: 'تعديل الملف الشخصي',
      shareProfile: 'مشاركة الملف الشخصي',
      clubTeams: 'فرق النادي',
      addTeam: '+ إضافة فريق',
      noTeamsYet: 'لا توجد فرق بعد',
      createFirstTeam: 'أنشئ فريقك الأول للبدء',
      noClubTeamsYet: 'هذا النادي لم ينشئ أي فرق بعد',
      createTeam: 'إنشاء فريق',
      associationClubsCount: '{count} نادي تابع للاتحاد{suffix}',
      manage: 'إدارة',
      cancelPlain: 'إلغاء',
      searchClubsPlaceholder: 'ابحث عن أندية (3 أحرف على الأقل)',
      alreadyAdded: 'تمت إضافته',
      add: '+ إضافة',
      noResults: 'لا توجد نتائج',
      noClubsYet: 'لا توجد أندية بعد',
      addClubs: 'إضافة أندية',
      noSurveys: 'لا توجد استبيانات',
      noActiveSurveys: 'لا توجد استبيانات نشطة متاحة الآن.',
      clubStaff: 'طاقم النادي',
      addStaff: '+ إضافة موظف',
      noStaffMembers: 'لا يوجد أفراد طاقم',
      addFirstStaff: 'أضف أول فرد طاقم للبدء',
      noClubStaffYet: 'هذا النادي لم يضف أي أفراد طاقم بعد',
      addStaffButton: 'إضافة موظف',
      call: 'اتصال',
      email: 'البريد',
      timesheetButton: 'سجل الدوام',
      clubInventory: 'مخزون النادي',
      addItem: '+ إضافة عنصر',
      inStock: 'المتوفر',
      unitPrice: 'سعر الوحدة:',
      description: 'الوصف:',
      noItems: 'لا توجد عناصر',
      addFirstInventory: 'أضف أول عنصر مخزون للبدء',
      noClubInventoryYet: 'هذا النادي لم يضف أي عناصر مخزون بعد',
      addItemButton: 'إضافة عنصر',
      members: 'الأعضاء',
      coach: 'مدرب',
      coaches: 'مدربون',
      checkProfile: 'عرض الملف الشخصي',
      admin: 'المسؤول',
      sendDm: 'إرسال رسالة',
      highlights: 'أبرز اللقطات',
      childrenHighlights: 'أبرز لقطات الأطفال',
      stats: 'الإحصائيات',
      childrenStats: 'إحصائيات الأطفال',
      height: 'الطول',
      weight: 'الوزن',
      sure: 'متأكد؟',
      yes: 'نعم',
      noShort: 'لا',
      clubSchedule: 'جدول النادي',
      yourTeamsSchedule: 'جدول فرقك',
      addEvent: '+ إضافة فعالية',
      eventsOfDay: 'فعاليات اليوم',
      cancelled: 'ملغي',
      noEventsToday: 'لا توجد فعاليات لهذا اليوم.',
      noUpcomingEvents: 'لا توجد فعاليات قادمة.',
      noScheduledEvents: 'لا توجد فعاليات مجدولة',
      createEvent: 'إنشاء فعالية',
      balance: 'الرصيد',
      availableBalance: 'الرصيد المتاح',
      topUp: 'شحن',
      sendMoney: 'إرسال أموال',
      amount: 'المبلغ',
      timesheetInfo: 'سيستخدم هذا موقعك الحالي لتسجيل دخولك إلى ناديك. يرجى ملاحظة أن سجل الدوام الخاص بك سيتم الوصول إليه واستخدامه من قبل قسم الموارد البشرية في ناديك.',
      onlineEvent: 'فعالية عبر الإنترنت',
      locationTbd: 'سيتم تحديد الموقع لاحقًا',
      versus: 'ضد',
    },
  },
} as const;

export type TranslationKey =
  | 'common.english'
  | 'common.arabic'
  | 'common.loading'
  | 'common.verified'
  | 'common.pending'
  | 'settings.title'
  | 'settings.subtitle'
  | 'settings.accountSettings'
  | 'settings.changePassword'
  | 'settings.badge'
  | 'settings.verification'
  | 'settings.language'
  | 'settings.languageHint'
  | 'settings.terms'
  | 'settings.privacy'
  | 'settings.website'
  | 'settings.deactivate'
  | 'settings.logout'
  | 'settings.ghost'
  | 'surveyRespond.titleFallback'
  | 'surveyRespond.back'
  | 'surveyRespond.previewMode'
  | 'surveyRespond.userNotAuthenticated'
  | 'surveyRespond.failedToLoad'
  | 'surveyRespond.unavailableTitle'
  | 'surveyRespond.unavailableMessage'
  | 'surveyRespond.sessionRequiredTitle'
  | 'surveyRespond.sessionRequiredMessage'
  | 'surveyRespond.requiredFieldsTitle'
  | 'surveyRespond.requiredFieldsMessage'
  | 'surveyRespond.failedToSubmit'
  | 'surveyRespond.errorTitle'
  | 'surveyRespond.failedToSubmitMessage'
  | 'surveyRespond.afterTrainingHint'
  | 'surveyRespond.typeYourResponse'
  | 'surveyRespond.answer'
  | 'surveyRespond.submitting'
  | 'surveyRespond.submit'
  | 'surveyRespond.submittedSuccessfully'
  | 'auth.back'
  | 'auth.loginTitle'
  | 'auth.loginSubtitle'
  | 'auth.needAccount'
  | 'auth.registerHere'
  | 'auth.loginHere'
  | 'auth.email'
  | 'auth.password'
  | 'auth.forgotPassword'
  | 'auth.next'
  | 'auth.loggingIn'
  | 'auth.login'
  | 'auth.pleaseFillEmailPassword'
  | 'auth.loginFailed'
  | 'auth.pleaseEnterEmail'
  | 'auth.emailCheckFailed'
  | 'auth.createAccountTitle'
  | 'auth.continueAccountTitle'
  | 'auth.createAccountSubtitle'
  | 'auth.name'
  | 'auth.phoneNumber'
  | 'auth.passwordHint'
  | 'auth.agreePrefix'
  | 'auth.termsAndConditions'
  | 'auth.creating'
  | 'auth.create'
  | 'auth.account'
  | 'auth.alreadyHaveAccount'
  | 'auth.disclaimer'
  | 'auth.invalidEmail'
  | 'auth.invalidPhone'
  | 'auth.passwordMin'
  | 'auth.fillAllFields'
  | 'search.placeholder'
  | 'search.filters'
  | 'search.searchByPosition'
  | 'search.enterPosition'
  | 'search.searchIn'
  | 'search.searchFor'
  | 'search.gender'
  | 'search.sport'
  | 'search.filter'
  | 'search.athletes'
  | 'search.athlete'
  | 'search.clubs'
  | 'search.club'
  | 'search.federations'
  | 'search.federation'
  | 'search.coaches'
  | 'search.coach'
  | 'search.all'
  | 'search.users'
  | 'search.teams'
  | 'search.events'
  | 'search.posts'
  | 'search.football'
  | 'search.basketball'
  | 'search.tennis'
  | 'search.swimming'
  | 'search.gymnastics'
  | 'search.male'
  | 'search.female'
  | 'notifications.title'
  | 'notifications.ghost'
  | 'notifications.unreadSingle'
  | 'notifications.unreadPlural'
  | 'notifications.empty'
  | 'notifications.markAllRead'
  | 'notifications.markRead'
  | 'notifications.delete'
  | 'notifications.now'
  | 'notifications.minutesAgo'
  | 'notifications.hoursAgo'
  | 'messages.title'
  | 'messages.noChats'
  | 'messages.deleteChat'
  | 'messages.areYouSure'
  | 'messages.yesDelete'
  | 'messages.no'
  | 'messages.cancel'
  | 'messages.newMessage'
  | 'messages.searchUsers'
  | 'messages.noUsersYet'
  | 'messages.noUsersFound'
  | 'messages.unknownUser'
  | 'messages.noMessages'
  | 'messages.errorTitle'
  | 'messages.selectUser'
  | 'messages.failedCreateChat'
  | 'messages.somethingWentWrong'
  | 'messages.now'
  | 'messages.minutesAgo'
  | 'messages.hoursAgo'
  | 'chat.back'
  | 'chat.termsDisclaimer'
  | 'chat.typeMessage'
  | 'chat.failedLoad'
  | 'chat.failedSend'
  | 'home.headline'
  | 'home.subtext'
  | 'home.login'
  | 'home.createAccount'
  | 'attendance.title'
  | 'attendance.ghost'
  | 'attendance.failedFetch'
  | 'attendance.failedConnect'
  | 'attendance.lockedTitle'
  | 'attendance.lockedMessage'
  | 'attendance.failedSubmit'
  | 'attendance.failedSubmitConnection'
  | 'attendance.editingClosesIn'
  | 'attendance.whoAttended'
  | 'attendance.selectedHint'
  | 'attendance.submitLocked'
  | 'attendance.submitting'
  | 'attendance.submit'
  | 'attendance.submitted'
  | 'teamDetails.backToTeams'
  | 'teamDetails.title'
  | 'teamDetails.uploadLogo'
  | 'teamDetails.changeLogo'
  | 'teamDetails.ageGroup'
  | 'teamDetails.gender'
  | 'teamDetails.noCoaches'
  | 'teamDetails.noMembers'
  | 'teamDetails.noEvents'
  | 'teamDetails.upcomingEvents'
  | 'teamDetails.coachCount'
  | 'teamDetails.memberCount'
  | 'teamManage.back'
  | 'teamManage.coachesTitle'
  | 'teamManage.coachesDesc'
  | 'teamManage.coachesGhost'
  | 'teamManage.membersTitle'
  | 'teamManage.membersDesc'
  | 'teamManage.membersGhost'
  | 'teamManage.edit'
  | 'teamManage.done'
  | 'teamManage.addCoachPlaceholder'
  | 'teamManage.addMemberPlaceholder'
  | 'teamManage.noSport'
  | 'teamManage.alreadyCoach'
  | 'teamManage.addAsCoach'
  | 'teamManage.alreadyMember'
  | 'teamManage.addAsMember'
  | 'teamManage.noResults'
  | 'teamManage.sure'
  | 'teamManage.yes'
  | 'teamManage.no'
  | 'teamManage.authMissing'
  | 'teamManage.failedAddCoach'
  | 'teamManage.failedAddMember'
  | 'teamManage.addCoachError'
  | 'teamManage.addMemberError'
  | 'teamManage.removeCoachError'
  | 'teamManage.removeMemberError'
  | 'scheduleDetails.back'
  | 'scheduleDetails.title'
  | 'scheduleDetails.ghost'
  | 'scheduleDetails.noEvent'
  | 'scheduleDetails.failedLoad'
  | 'scheduleDetails.recurringTitle'
  | 'scheduleDetails.recurringMessage'
  | 'scheduleDetails.thisEventOnly'
  | 'scheduleDetails.allOccurrences'
  | 'scheduleDetails.cancel'
  | 'scheduleDetails.confirmCancel'
  | 'scheduleDetails.confirmCancelAll'
  | 'scheduleDetails.confirmCancelOne'
  | 'scheduleDetails.no'
  | 'scheduleDetails.yesCancel'
  | 'scheduleDetails.failedCancel'
  | 'scheduleDetails.cancelEvent'
  | 'scheduleDetails.edit'
  | 'scheduleDetails.attendance'
  | 'scheduleDetails.eventTitle'
  | 'scheduleDetails.description'
  | 'scheduleDetails.noDescription'
  | 'scheduleDetails.date'
  | 'scheduleDetails.from'
  | 'scheduleDetails.till'
  | 'scheduleDetails.location'
  | 'scheduleDetails.scheduled'
  | 'scheduleDetails.cancelled'
  | 'scheduleForm.backToSchedule'
  | 'scheduleForm.newEventTitle'
  | 'scheduleForm.newEventDesc'
  | 'scheduleForm.editEventTitle'
  | 'scheduleForm.editEventDesc'
  | 'scheduleForm.ghost'
  | 'scheduleForm.eventTitle'
  | 'scheduleForm.enterEventTitle'
  | 'scheduleForm.date'
  | 'scheduleForm.from'
  | 'scheduleForm.till'
  | 'scheduleForm.eventType'
  | 'scheduleForm.team'
  | 'scheduleForm.description'
  | 'scheduleForm.enterDescription'
  | 'scheduleForm.recurringEvent'
  | 'scheduleForm.recurringHint'
  | 'scheduleForm.locationType'
  | 'scheduleForm.venueName'
  | 'scheduleForm.enterVenueName'
  | 'scheduleForm.venueAddress'
  | 'scheduleForm.enterVenueAddress'
  | 'scheduleForm.onlineMeetingLink'
  | 'scheduleForm.enterMeetingLink'
  | 'scheduleForm.venueLocation'
  | 'scheduleForm.searchLocation'
  | 'scheduleForm.trainingFocus'
  | 'scheduleForm.trainingFocusPlaceholder'
  | 'scheduleForm.requiredEquipment'
  | 'scheduleForm.searchEquipment'
  | 'scheduleForm.available'
  | 'scheduleForm.noEquipmentResults'
  | 'scheduleForm.add'
  | 'scheduleForm.opponentName'
  | 'scheduleForm.enterOpponentName'
  | 'scheduleForm.opponentLogoUrl'
  | 'scheduleForm.enterOpponentLogoUrl'
  | 'scheduleForm.homeOrAway'
  | 'scheduleForm.cancel'
  | 'scheduleForm.saving'
  | 'scheduleForm.save'
  | 'scheduleForm.editing'
  | 'scheduleForm.edit'
  | 'scheduleForm.fillRequired'
  | 'scheduleForm.endTimeAfterStart'
  | 'scheduleForm.failedCreate'
  | 'scheduleForm.failedLoad'
  | 'scheduleForm.failedUpdate'
  | 'scheduleForm.recurringEditTitle'
  | 'scheduleForm.recurringEditMessage'
  | 'scheduleForm.thisEventOnly'
  | 'scheduleForm.allOccurrences'
  | 'scheduleForm.no'
  | 'scheduleForm.daily'
  | 'scheduleForm.weekly'
  | 'scheduleForm.monthly'
  | 'scheduleForm.yearly'
  | 'scheduleForm.trainingSession'
  | 'scheduleForm.training'
  | 'scheduleForm.match'
  | 'scheduleForm.meeting'
  | 'scheduleForm.tournament'
  | 'scheduleForm.venue'
  | 'scheduleForm.online'
  | 'scheduleForm.toBeDetermined'
  | 'scheduleForm.homeGame'
  | 'scheduleForm.awayGame'
  | 'payments.backToFinancials'
  | 'payments.newPayment'
  | 'payments.createPaymentDesc'
  | 'payments.paymentDetails'
  | 'payments.selectBeneficiary'
  | 'payments.searchBeneficiary'
  | 'payments.select'
  | 'payments.noResults'
  | 'payments.noResultsHint'
  | 'payments.selectedUser'
  | 'payments.amount'
  | 'payments.amountPlaceholder'
  | 'payments.paymentType'
  | 'payments.registrationFees'
  | 'payments.monthlyFees'
  | 'payments.equipmentPurchase'
  | 'payments.salary'
  | 'payments.other'
  | 'payments.specifyPaymentType'
  | 'payments.note'
  | 'payments.notePlaceholder'
  | 'payments.cancel'
  | 'payments.paying'
  | 'payments.pay'
  | 'payments.userNotAuthenticated'
  | 'payments.failedSearchUsers'
  | 'payments.failedSave'
  | 'payments.unexpectedSave'
  | 'payments.authMissing'
  | 'payments.failedFetch'
  | 'payments.failedFetchGeneric'
  | 'payments.failedSettle'
  | 'payments.errorSettling'
  | 'payments.type'
  | 'payments.date'
  | 'payments.status'
  | 'payments.payer'
  | 'payments.beneficiary'
  | 'payments.pending'
  | 'payments.completed'
  | 'payments.declined'
  | 'payments.paymentNumber'
  | 'wizard.accountType'
  | 'wizard.whatAreYou'
  | 'wizard.next'
  | 'wizard.selectAccountType'
  | 'wizard.parent'
  | 'wizard.athlete'
  | 'wizard.club'
  | 'wizard.association'
  | 'wizard.scout'
  | 'wizard.sponsor'
  | 'wizard.ghost'
  | 'wizard.dobTitle'
  | 'wizard.dobDesc'
  | 'wizard.establishedTitle'
  | 'wizard.establishedDescClub'
  | 'wizard.establishedDescAssociation'
  | 'wizard.dobGhost'
  | 'wizard.sinceGhost'
  | 'wizard.dayRequired'
  | 'wizard.monthRequired'
  | 'wizard.yearRequired'
  | 'wizard.invalidDate'
  | 'wizard.numbersOnlyDate'
  | 'wizard.monthRange'
  | 'wizard.dayRange'
  | 'wizard.futureDate'
  | 'wizard.parentUnder18'
  | 'wizard.scoutUnder18'
  | 'wizard.sponsorUnder18'
  | 'wizard.fillAllFields'
  | 'wizard.parentEmailHint'
  | 'wizard.parentEmail'
  | 'wizard.gender'
  | 'wizard.admin'
  | 'wizard.adminName'
  | 'wizard.adminEmail'
  | 'wizard.adminHint'
  | 'wizard.summary'
  | 'wizard.bio'
  | 'wizard.describeYourself'
  | 'wizard.describeClub'
  | 'wizard.describeAssociation'
  | 'wizard.creatingAccount'
  | 'wizard.aboutClub'
  | 'wizard.aboutYou'
  | 'wizard.tellUsMoreClub'
  | 'wizard.tellUsMoreYou'
  | 'wizard.sorryInconvenience'
  | 'wizard.tryAgain'
  | 'wizard.genderRequired'
  | 'wizard.adminNameRequired'
  | 'wizard.adminEmailRequired'
  | 'wizard.registrationError'
  | 'wizard.sportType'
  | 'wizard.organization'
  | 'wizard.whatDoYouDo'
  | 'wizard.organizationQuestion'
  | 'wizard.sportGhost'
  | 'wizard.organizationGhost'
  | 'wizard.noOrganization'
  | 'wizard.organizationName'
  | 'wizard.organizationLocation'
  | 'wizard.organizationRole'
  | 'wizard.organizationSince'
  | 'wizard.sportsInterested'
  | 'wizard.noSportsAvailable'
  | 'wizard.selectSportType'
  | 'wizard.addClubs'
  | 'wizard.selectClub'
  | 'wizard.associationClubsQuestion'
  | 'wizard.athleteClubQuestion'
  | 'wizard.clubsGhost'
  | 'wizard.clubGhost'
  | 'wizard.noClubIndependent'
  | 'wizard.athleteIndependentHint'
  | 'wizard.athleteClubContactHint'
  | 'wizard.searchClubs'
  | 'wizard.noClubsFound'
  | 'wizard.selectClubRequired'
  | 'notFound.title'
  | 'notFound.message'
  | 'notFound.goHome'
  | 'badge.back'
  | 'badge.title'
  | 'badge.ghost'
  | 'badge.congratulations'
  | 'badge.verifiedMessage'
  | 'badge.benefitsTitle'
  | 'badge.benefitVisibility'
  | 'badge.benefitTrust'
  | 'badge.benefitSupport'
  | 'badge.whyTitle'
  | 'badge.whyMessage'
  | 'badge.verificationBenefits'
  | 'badge.benefitCredibility'
  | 'badge.benefitEngagement'
  | 'badge.benefitDistinguish'
  | 'badge.benefitExclusive'
  | 'badge.statsTitle'
  | 'badge.statSponsors'
  | 'badge.statScouts'
  | 'badge.statSearch'
  | 'badge.faq'
  | 'badge.faqWhy'
  | 'badge.faqWhyAnswer'
  | 'badge.faqDuration'
  | 'badge.faqDurationAnswer'
  | 'badge.faqLose'
  | 'badge.faqLoseAnswer'
  | 'badge.ctaTitle'
  | 'badge.oneTimePurchase'
  | 'badge.comingSoon'
  | 'placesTest.searchPlaceholder'
  | 'placesTest.selected'
  | 'placesTest.latitude'
  | 'placesTest.longitude'
  | 'staffForm.backToStaff'
  | 'account.back'
  | 'account.accountSettings'
  | 'account.changePassword'
  | 'account.forgotPassword'
  | 'account.resetPasswordDesc'
  | 'account.forgotGhost'
  | 'account.accountGhost'
  | 'account.passwordGhost'
  | 'account.emailAddress'
  | 'account.phoneNumber'
  | 'account.invalidEmail'
  | 'account.invalidPhone'
  | 'account.nothingChanged'
  | 'account.emailUpdateFailed'
  | 'account.phoneUpdateFailed'
  | 'account.failedUpdatePhone'
  | 'account.cancel'
  | 'account.save'
  | 'account.saving'
  | 'account.currentPassword'
  | 'account.newPassword'
  | 'account.confirmPassword'
  | 'account.password'
  | 'account.currentPasswordRequired'
  | 'account.currentPasswordWrong'
  | 'account.genericError'
  | 'account.passwordsMismatch'
  | 'account.passwordSameAsOld'
  | 'account.passwordTooShort'
  | 'account.next'
  | 'account.checking'
  | 'account.checkEmail'
  | 'account.verifyEmail'
  | 'account.noAccountFound'
  | 'account.validEmailRequired'
  | 'account.failedSendOtp'
  | 'account.otpSentHint'
  | 'account.resendCode'
  | 'account.resetPassword'
  | 'account.verifyAndContinue'
  | 'account.copied'
  | 'account.emailOtpFailed'
  | 'account.phoneOtpFailed'
  | 'account.sendingOtp'
  | 'account.sendOtp'
  | 'account.verifying'
  | 'account.verify'
  | 'account.getNewCode'
  | 'account.verifyAccount'
  | 'account.verifyAccountDesc'
  | 'account.verifyGhost'
  | 'account.verified'
  | 'account.emailAddressLabel'
  | 'account.phoneNumberLabel'
  | 'profileEditor.editProfile'
  | 'profileEditor.changeYourData'
  | 'profileEditor.editGhost'
  | 'profileEditor.uploadAvatar'
  | 'profileEditor.changeAvatar'
  | 'profileEditor.childrenCount'
  | 'profileEditor.addChild'
  | 'profileEditor.noChildrenYet'
  | 'profileEditor.admin'
  | 'profileEditor.contactInfo'
  | 'profileEditor.hiddenEmptyFields'
  | 'profileEditor.description'
  | 'profileEditor.openingHours'
  | 'profileEditor.phoneNumber'
  | 'profileEditor.email'
  | 'profileEditor.facebookUsername'
  | 'profileEditor.instagramUsername'
  | 'profileEditor.whatsappNumber'
  | 'profileEditor.telegramUsername'
  | 'profileEditor.tiktokUsername'
  | 'profileEditor.snapchatUsername'
  | 'profileEditor.location'
  | 'profileEditor.useCurrentLocation'
  | 'profileEditor.mapHint'
  | 'profileEditor.summary'
  | 'profileEditor.bio'
  | 'profileEditor.aboutClub'
  | 'profileEditor.aboutAssociation'
  | 'profileEditor.aboutYou'
  | 'profileEditor.country'
  | 'profileEditor.establishmentDate'
  | 'profileEditor.dateOfBirth'
  | 'profileEditor.position'
  | 'profileEditor.positionPlaceholder'
  | 'profileEditor.height'
  | 'profileEditor.heightPlaceholder'
  | 'profileEditor.weight'
  | 'profileEditor.weightPlaceholder'
  | 'profileEditor.achievements'
  | 'profileEditor.achievementsPlaceholder'
  | 'profileEditor.cancel'
  | 'profileEditor.save'
  | 'profileEditor.saving'
  | 'profileEditor.invalidDate'
  | 'profileEditor.futureDate'
  | 'profileEditor.addChildrenTitle'
  | 'profileEditor.addChildrenDesc'
  | 'profileEditor.childrenGhost'
  | 'profileEditor.search'
  | 'profileEditor.searchAthletePlaceholder'
  | 'profileEditor.alreadyChild'
  | 'profileEditor.addAsChild'
  | 'profileEditor.noResultsChild'
  | 'profileEditor.createNewAccount'
  | 'profileEditor.childAlreadyAdded'
  | 'profileEditor.childAccount'
  | 'profileEditor.childAccountDesc'
  | 'profileEditor.childName'
  | 'profileEditor.childEmail'
  | 'profileEditor.loginHint'
  | 'profileEditor.pleaseFillNameEmail'
  | 'profileEditor.childCreateFailed'
  | 'profileEditor.childCreated'
  | 'profileEditor.copy'
  | 'profileEditor.copied'
  | 'profileEditor.share'
  | 'profileEditor.childCredentialsHint'
  | 'profileEditor.addAnotherChild'
  | 'profileEditor.continueEditing'
  | 'profileEditor.uploadLogo'
  | 'profileEditor.uploadAvatarTitle'
  | 'profileEditor.changeLogo'
  | 'profileEditor.changeProfilePicture'
  | 'profileEditor.logoGhost'
  | 'profileEditor.avatarGhost'
  | 'profileEditor.imageTooLarge'
  | 'profileEditor.removingBackground'
  | 'profileEditor.tapChangeImage'
  | 'profileEditor.tapUploadImage'
  | 'profileEditor.saveLower'
  | 'profileEditor.savingLower'
  | 'createPost.placeholder'
  | 'createPost.photoVideo'
  | 'createPost.post'
  | 'createPost.posting'
  | 'createPost.mediaPermission'
  | 'inventory.backToInventory'
  | 'inventory.newItem'
  | 'inventory.newItemDesc'
  | 'inventory.ghost'
  | 'inventory.itemName'
  | 'inventory.enterItemName'
  | 'inventory.category'
  | 'inventory.quantity'
  | 'inventory.enterQuantity'
  | 'inventory.unitPrice'
  | 'inventory.amount'
  | 'inventory.description'
  | 'inventory.enterDescription'
  | 'inventory.cancel'
  | 'inventory.save'
  | 'inventory.saving'
  | 'inventory.validationTitle'
  | 'inventory.errorTitle'
  | 'inventory.userRequired'
  | 'inventory.requiredFields'
  | 'inventory.failedCreate'
  | 'inventory.genericCreateError'
  | 'inventory.detailsTitle'
  | 'inventory.noItem'
  | 'inventory.image'
  | 'inventory.availableQuantity'
  | 'inventory.noDescription'
  | 'inventory.equipment'
  | 'inventory.uniform'
  | 'inventory.accessories'
  | 'inventory.medicalSupplies'
  | 'teamCreate.backToTeams'
  | 'teamCreate.newTeam'
  | 'teamCreate.newTeamDesc'
  | 'teamCreate.ghost'
  | 'teamCreate.teamLogo'
  | 'teamCreate.tapChangeImage'
  | 'teamCreate.tapUploadImage'
  | 'teamCreate.teamName'
  | 'teamCreate.enterTeamName'
  | 'teamCreate.coaches'
  | 'teamCreate.noCoachesAvailable'
  | 'teamCreate.sport'
  | 'teamCreate.ageGroup'
  | 'teamCreate.gender'
  | 'teamCreate.addAgeGroup'
  | 'teamCreate.newAgeGroup'
  | 'teamCreate.ageGroupRequired'
  | 'teamCreate.cancel'
  | 'teamCreate.save'
  | 'teamCreate.saving'
  | 'teamCreate.teamNameRequired'
  | 'teamCreate.selectSport'
  | 'teamCreate.imageTooLarge'
  | 'teamCreate.mediaPermission'
  | 'teamCreate.failedPickImage'
  | 'teamCreate.errorTitle'
  | 'teamCreate.failedCreate'
  | 'teamSchedule.backToTeams'
  | 'teamSchedule.title'
  | 'teamSchedule.desc'
  | 'teamSchedule.ghost'
  | 'teamSchedule.upcomingEvents'
  | 'teamSchedule.noEvents'
  | 'teamSchedule.onlineEvent'
  | 'teamSchedule.locationTbd'
  | 'teamSchedule.versus'
  | 'timesheet.backToStaff'
  | 'timesheet.title'
  | 'timesheet.ghost'
  | 'timesheet.noStaff'
  | 'timesheet.history'
  | 'timesheet.noRecords'
  | 'timesheet.locationMatch'
  | 'timesheet.locationMismatch'
  | 'timesheet.in'
  | 'timesheet.out'
  | 'timesheet.notCheckedOut'
  | 'timesheet.defaultStaffName'
  | 'timesheet.failedLoad'
  | 'timesheet.errorTitle'
  | 'coachSurvey.backToSurveys'
  | 'coachSurvey.title'
  | 'coachSurvey.ghost'
  | 'coachSurvey.filters'
  | 'coachSurvey.clear'
  | 'coachSurvey.userId'
  | 'coachSurvey.filterUserId'
  | 'coachSurvey.from'
  | 'coachSurvey.to'
  | 'coachSurvey.applyFilters'
  | 'coachSurvey.submissions'
  | 'coachSurvey.noSubmissions'
  | 'coachSurvey.unknownUser'
  | 'coachSurvey.question'
  | 'coachSurvey.userNotAuthenticated'
  | 'coachSurvey.failedSurvey'
  | 'coachSurvey.failedResponses'
  | 'coachSurvey.submissionCount'
  | 'coachSurvey.dataHintFrom'
  | 'coachSurvey.dataHintTo'
  | 'manager.dashboard'
  | 'manager.logout'
  | 'manager.quickLinks'
  | 'manager.performanceTests'
  | 'manager.surveyManager'
  | 'manager.sportsManager'
  | 'manager.manualNotifications'
  | 'manager.addBulkAthletes'
  | 'manager.addAthlete'
  | 'manager.back'
  | 'manager.bulkAthletes'
  | 'manager.bulkAthletesDesc'
  | 'manager.template'
  | 'manager.downloadTemplate'
  | 'manager.templateHint'
  | 'manager.newBulkUpload'
  | 'manager.processing'
  | 'manager.uploadExcel'
  | 'manager.preview'
  | 'manager.errors'
  | 'manager.missingName'
  | 'manager.missingEmail'
  | 'manager.creating'
  | 'manager.submitBulk'
  | 'manager.result'
  | 'manager.totalRows'
  | 'manager.created'
  | 'manager.failed'
  | 'manager.createdUsers'
  | 'manager.history'
  | 'manager.noBulkUploads'
  | 'manager.notifications'
  | 'manager.target'
  | 'manager.notification'
  | 'manager.searchByNameOrEmail'
  | 'manager.useTemplate'
  | 'manager.randomTest'
  | 'manager.random'
  | 'manager.title'
  | 'manager.body'
  | 'manager.dataJson'
  | 'manager.notificationTitlePlaceholder'
  | 'manager.notificationBodyPlaceholder'
  | 'manager.sendNotification'
  | 'manager.sendingNotification'
  | 'manager.selectTarget'
  | 'manager.selectAtLeastOneUser'
  | 'manager.selectSport'
  | 'manager.invalidJson'
  | 'manager.failedSearch'
  | 'manager.failedSendNotifications'
  | 'manager.sentNotifications'
  | 'manager.searchPlaceholder'
  | 'manager.selectSportPlaceholder'
  | 'manager.sportsDesc'
  | 'manager.addNewSport'
  | 'manager.sportName'
  | 'manager.uploadIcon'
  | 'manager.createSport'
  | 'manager.allSports'
  | 'manager.noSportsFound'
  | 'manager.visible'
  | 'manager.hidden'
  | 'manager.save'
  | 'manager.edit'
  | 'manager.hide'
  | 'manager.show'
  | 'manager.icon'
  | 'manager.delete'
  | 'manager.failedLoadSports'
  | 'manager.sportNameRequired'
  | 'manager.failedCreateSport'
  | 'manager.failedUpdateSport'
  | 'manager.failedUpdateVisibility'
  | 'manager.deleteSportTitle'
  | 'manager.deleteSportMessage'
  | 'manager.failedDeleteSport'
  | 'manager.failedUploadIcon'
  | 'manager.permissionRequired'
  | 'manager.allowPhotos'
  | 'managerAthlete.back'
  | 'managerAthlete.newAthlete'
  | 'managerAthlete.addAthleteDesc'
  | 'managerAthlete.basicInfo'
  | 'managerAthlete.athleteInfo'
  | 'managerAthlete.name'
  | 'managerAthlete.email'
  | 'managerAthlete.phone'
  | 'managerAthlete.gender'
  | 'managerAthlete.sport'
  | 'managerAthlete.club'
  | 'managerAthlete.enterAthleteName'
  | 'managerAthlete.enterEmail'
  | 'managerAthlete.loginHint'
  | 'managerAthlete.enterPhone'
  | 'managerAthlete.selectGender'
  | 'managerAthlete.selectSport'
  | 'managerAthlete.searchClub'
  | 'managerAthlete.remove'
  | 'managerAthlete.cancel'
  | 'managerAthlete.save'
  | 'managerAthlete.saving'
  | 'managerAthlete.requiredFields'
  | 'managerAthlete.failedCreate'
  | 'managerAthlete.created'
  | 'managerAthlete.copy'
  | 'managerAthlete.copied'
  | 'managerAthlete.share'
  | 'managerAthlete.credentialsHint'
  | 'managerAthlete.addAnother'
  | 'managerAthlete.backToDashboard'
  | 'managerAthlete.emailLabel'
  | 'managerSurvey.title'
  | 'managerSurvey.editSurvey'
  | 'managerSurvey.createSurvey'
  | 'managerSurvey.newSurvey'
  | 'managerSurvey.surveyTitle'
  | 'managerSurvey.setActive'
  | 'managerSurvey.repeatingSurvey'
  | 'managerSurvey.restriction'
  | 'managerSurvey.searchRestriction'
  | 'managerSurvey.searchScope'
  | 'managerSurvey.selectedRestriction'
  | 'managerSurvey.clear'
  | 'managerSurvey.questions'
  | 'managerSurvey.addQuestion'
  | 'managerSurvey.question'
  | 'managerSurvey.questionText'
  | 'managerSurvey.helperText'
  | 'managerSurvey.questionType'
  | 'managerSurvey.required'
  | 'managerSurvey.conditionalDisplay'
  | 'managerSurvey.alwaysShow'
  | 'managerSurvey.conditionalAnswer'
  | 'managerSurvey.conditionalHint'
  | 'managerSurvey.options'
  | 'managerSurvey.addOption'
  | 'managerSurvey.option'
  | 'managerSurvey.scaleSettings'
  | 'managerSurvey.min'
  | 'managerSurvey.max'
  | 'managerSurvey.step'
  | 'managerSurvey.create'
  | 'managerSurvey.update'
  | 'managerSurvey.existingSurveys'
  | 'managerSurvey.noSurveys'
  | 'managerSurvey.active'
  | 'managerSurvey.submissions'
  | 'managerSurvey.preview'
  | 'managerSurvey.delete'
  | 'managerSurvey.userNotAuthenticated'
  | 'managerSurvey.failedLoad'
  | 'managerSurvey.titleRequired'
  | 'managerSurvey.cadenceRequired'
  | 'managerSurvey.restrictionRequired'
  | 'managerSurvey.questionsNeedText'
  | 'managerSurvey.choicesNeedOption'
  | 'managerSurvey.failedSave'
  | 'managerSurvey.deleteTitle'
  | 'managerSurvey.deleteMessage'
  | 'managerSurvey.failedDelete'
  | 'managerSurvey.failedSearch'
  | 'managerSurvey.questionsCount'
  | 'skillsTesting.testedSubject'
  | 'skillsTesting.searchPlaceholder'
  | 'skillsTesting.noToken'
  | 'skillsTesting.selectedUserNotAthlete'
  | 'skillsTesting.backToSearch'
  | 'skillsTesting.selectedUser'
  | 'skillsTesting.lastUpdated'
  | 'skillsTesting.addNewResult'
  | 'skillsTesting.cancel'
  | 'skillsTesting.newTestResults'
  | 'skillsTesting.skill'
  | 'skillsTesting.score'
  | 'skillsTesting.addAnotherSkill'
  | 'skillsTesting.submitting'
  | 'skillsTesting.submitResults'
  | 'skillsTesting.noSkills'
  | 'skillsTesting.noUserData'
  | 'staffForm.newStaff'
  | 'staffForm.addStaffDesc'
  | 'staffForm.searchSection'
  | 'staffForm.searchPlaceholder'
  | 'staffForm.addAsStaff'
  | 'staffForm.cantFind'
  | 'staffForm.createWithoutAccountHint'
  | 'staffForm.addWithoutAccount'
  | 'staffForm.noResults'
  | 'staffForm.noResultsHint'
  | 'staffForm.selectedUser'
  | 'staffForm.retrySearch'
  | 'staffForm.retrySearchHint'
  | 'staffForm.basicInfo'
  | 'staffForm.professionalInfo'
  | 'staffForm.name'
  | 'staffForm.enterStaffName'
  | 'staffForm.email'
  | 'staffForm.enterEmail'
  | 'staffForm.loginHint'
  | 'staffForm.role'
  | 'staffForm.assignedTeams'
  | 'staffForm.noTeams'
  | 'staffForm.employmentType'
  | 'staffForm.salaryPerMonth'
  | 'staffForm.salaryAmount'
  | 'staffForm.qualifications'
  | 'staffForm.addQualification'
  | 'staffForm.certifications'
  | 'staffForm.addCertification'
  | 'staffForm.add'
  | 'staffForm.status'
  | 'staffForm.active'
  | 'staffForm.inactive'
  | 'staffForm.cancel'
  | 'staffForm.saving'
  | 'staffForm.save'
  | 'staffForm.fillRequired'
  | 'staffForm.failedLoadTeams'
  | 'staffForm.failedSearchUsers'
  | 'staffForm.failedCreate'
  | 'staffForm.coach'
  | 'staffForm.manager'
  | 'staffForm.boardMember'
  | 'staffForm.medicalStaff'
  | 'staffForm.fullTime'
  | 'staffForm.partTime'
  | 'staffForm.contract'
  | 'staffForm.volunteer'
  | 'staffForm.ghost'
  | 'staffForm.successTitle'
  | 'staffForm.emailPrefix'
  | 'staffForm.copied'
  | 'staffForm.copy'
  | 'staffForm.share'
  | 'staffForm.credentialsHint'
  | 'staffForm.addAnother'
  | 'staffForm.backToList'
  | 'staffForm.tapToChangeImage'
  | 'staffForm.tapToUploadImage'
  | 'staffDetails.backToStaff'
  | 'staffDetails.title'
  | 'staffDetails.ghost'
  | 'staffDetails.noStaff'
  | 'staffDetails.failedLoad'
  | 'staffDetails.defaultRole'
  | 'staffDetails.contactInfo'
  | 'staffDetails.noTeamsAssigned'
  | 'staffDetails.qualifications'
  | 'staffDetails.certifications'
  | 'staffDetails.none'
  | 'staffDetails.employment'
  | 'staffDetails.type'
  | 'staffDetails.salary'
  | 'staffDetails.status'
  | 'staffDetails.active'
  | 'staffDetails.inactive'
  | 'staffDetails.notAvailable'
  | 'landing.comments'
  | 'landing.noComments'
  | 'landing.newPost'
  | 'landing.whatsOnYourMind'
  | 'landing.photoVideo'
  | 'landing.cancel'
  | 'landing.post'
  | 'landing.posting'
  | 'landing.noPosts'
  | 'landing.writeComment'
  | 'landing.yourProfile'
  | 'landing.userProfile'
  | 'landing.deletePost'
  | 'landing.areYouSure'
  | 'landing.yesDelete'
  | 'landing.no'
  | 'profile.defaultTitle'
  | 'profile.profile'
  | 'profile.teams'
  | 'profile.schedule'
  | 'profile.staff'
  | 'profile.inventory'
  | 'profile.financials'
  | 'profile.surveys'
  | 'profile.timesheet'
  | 'profile.performance'
  | 'profile.clubs'
  | 'profile.contact'
  | 'profile.addContactInfo'
  | 'profile.noContactInfo'
  | 'profile.bio'
  | 'profile.summary'
  | 'profile.interestedIn'
  | 'profile.sport'
  | 'profile.sports'
  | 'profile.country'
  | 'profile.playsIn'
  | 'profile.team'
  | 'profile.teamsCount'
  | 'profile.coachOf'
  | 'profile.club'
  | 'profile.independent'
  | 'profile.organization'
  | 'profile.totalSports'
  | 'profile.totalTeams'
  | 'profile.totalMembers'
  | 'profile.established'
  | 'profile.dateOfBirth'
  | 'profile.uploadLogo'
  | 'profile.uploadAvatar'
  | 'profile.changeLogo'
  | 'profile.changeAvatar'
  | 'profile.completeProfile'
  | 'profile.getDirections'
  | 'profile.comingSoon'
  | 'profile.financialsSoon'
  | 'profile.history'
  | 'profile.checkIn'
  | 'profile.checkOut'
  | 'profile.noTimesheetRecords'
  | 'profile.locationMatch'
  | 'profile.locationMismatch'
  | 'profile.in'
  | 'profile.out'
  | 'profile.notCheckedOut'
  | 'profile.noDataYet'
  | 'profile.lastTestDate'
  | 'profile.overallAveragePerformance'
  | 'profile.lastUpdated'
  | 'profile.nothingToShow'
  | 'profile.achievements'
  | 'profile.childrenAchievements'
  | 'profile.upcomingEvents'
  | 'profile.childrenUpcomingEvents'
  | 'profile.editProfile'
  | 'profile.shareProfile'
  | 'profile.clubTeams'
  | 'profile.addTeam'
  | 'profile.noTeamsYet'
  | 'profile.createFirstTeam'
  | 'profile.noClubTeamsYet'
  | 'profile.createTeam'
  | 'profile.associationClubsCount'
  | 'profile.manage'
  | 'profile.cancelPlain'
  | 'profile.searchClubsPlaceholder'
  | 'profile.alreadyAdded'
  | 'profile.add'
  | 'profile.noResults'
  | 'profile.noClubsYet'
  | 'profile.addClubs'
  | 'profile.noSurveys'
  | 'profile.noActiveSurveys'
  | 'profile.clubStaff'
  | 'profile.addStaff'
  | 'profile.noStaffMembers'
  | 'profile.addFirstStaff'
  | 'profile.noClubStaffYet'
  | 'profile.addStaffButton'
  | 'profile.call'
  | 'profile.email'
  | 'profile.timesheetButton'
  | 'profile.clubInventory'
  | 'profile.addItem'
  | 'profile.inStock'
  | 'profile.unitPrice'
  | 'profile.description'
  | 'profile.noItems'
  | 'profile.addFirstInventory'
  | 'profile.noClubInventoryYet'
  | 'profile.addItemButton'
  | 'profile.members'
  | 'profile.coach'
  | 'profile.coaches'
  | 'profile.checkProfile'
  | 'profile.admin'
  | 'profile.sendDm'
  | 'profile.highlights'
  | 'profile.childrenHighlights'
  | 'profile.stats'
  | 'profile.childrenStats'
  | 'profile.height'
  | 'profile.weight'
  | 'profile.sure'
  | 'profile.yes'
  | 'profile.noShort'
  | 'profile.clubSchedule'
  | 'profile.yourTeamsSchedule'
  | 'profile.addEvent'
  | 'profile.eventsOfDay'
  | 'profile.cancelled'
  | 'profile.noEventsToday'
  | 'profile.noUpcomingEvents'
  | 'profile.noScheduledEvents'
  | 'profile.createEvent'
  | 'profile.balance'
  | 'profile.availableBalance'
  | 'profile.topUp'
  | 'profile.sendMoney'
  | 'profile.amount'
  | 'profile.timesheetInfo'
  | 'profile.onlineEvent'
  | 'profile.locationTbd'
  | 'profile.versus';
