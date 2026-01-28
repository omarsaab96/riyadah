const NOTIFICATION_TEMPLATES = {
  survey: {
    emoji: '📝',
    titles: ['📝 Survey'],
    bodies: ['Please complete your survey.'],
  },
  event: {
    emoji: '🗓️',
    titles: ['🗓️ Event'],
    bodies: ['You have a new event scheduled.'],
  },
  event_reminder: {
    emoji: '⏰',
    titles: ['⏰ Event Reminder'],
    bodies: ['Your event starts soon.'],
  },
  monthly_payment_reminder: {
    emoji: '💳',
    titles: ['💳 Payment Reminder'],
    bodies: ['Please note that your club membership fee is due today.'],
  },
  offer: {
    emoji: '🎁',
    titles: ['🎁 Offer'],
    bodies: ['A new offer is available for you.'],
  },
  post_like: {
    emoji: '❤️',
    titles: ['❤️ New Like'],
    bodies: ['Someone liked your post.'],
  },
  post_comment: {
    emoji: '🗨️',
    titles: ['🗨️ New Comment'],
    bodies: ['Someone commented on your post.'],
  },
  team_member: {
    emoji: '👥',
    titles: ['👥 Added as member'],
    bodies: ['You have been added to a team.'],
  },
  team_coach: {
    emoji: '📋',
    titles: ['📋 Added as coach'],
    bodies: ['You have been assigned to coach a team.'],
  },
  chat_message: {
    emoji: '💬',
    titles: ['💬 New Message'],
    bodies: ['You have a new message.'],
  },
  info: {
    emoji: 'ℹ️',
    titles: ['ℹ️ Info'],
    bodies: ['Here is an update.'],
  },
  alert: {
    emoji: '⚠️',
    titles: ['⚠️ Alert'],
    bodies: ['Please take action.'],
  },
  system: {
    emoji: '⚙️',
    titles: ['⚙️ System Notice'],
    bodies: ['System update.'],
  }
};

const pickRandom = (list = []) => list[Math.floor(Math.random() * list.length)];

const ensureEmojiPrefix = (emoji, text) => {
  if (!emoji || !text) return text;
  const trimmed = text.trim();
  if (trimmed.startsWith(emoji)) return text;
  return `${emoji} ${trimmed}`;
};

const buildNotificationContent = ({ type, title, body, random = false }) => {
  const template = NOTIFICATION_TEMPLATES[type];
  const fallbackTitle = title || 'A lot is happening right now!';
  const fallbackBody = body || 'Jump back in to see what\'s going on.';

  if (!template) {
    return {
      title: fallbackTitle,
      body: fallbackBody,
    };
  }

  const baseTitle = random ? pickRandom(template.titles) : (title || template.titles[0]);
  const baseBody = random ? pickRandom(template.bodies) : (body || template.bodies[0]);

  return {
    title: ensureEmojiPrefix(template.emoji, baseTitle),
    body: baseBody,
  };
};

module.exports = {
  NOTIFICATION_TEMPLATES,
  buildNotificationContent,
};
