require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const app = express();
const port = Number(process.env.PORT || 3000);
const dataDir = path.join(__dirname, 'submissions');

fs.mkdirSync(dataDir, { recursive: true });
app.set('trust proxy', true);
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

app.use('/api/', limiter);

const emailConfigured = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_TO &&
  process.env.EMAIL_FROM
);

let mailTransporter = null;
if (emailConfigured) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function appendSubmission(type, payload) {
  const file = path.join(dataDir, `${type}.jsonl`);
  const record = {
    id: `${type}-${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    payload,
  };
  await fs.promises.appendFile(file, JSON.stringify(record) + '\n');
  return record;
}

async function sendNotificationEmail(subject, text) {
  if (!mailTransporter) return;

  await mailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject,
    text,
  });
}

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
}

const contactValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('country').trim().notEmpty().withMessage('Country is required.'),
  body('email').trim().isEmail().withMessage('A valid email address is required.'),
  body('subject').trim().notEmpty().withMessage('A subject is required.'),
  body('message').trim().isLength({ min: 20 }).withMessage('Please provide a message with at least 20 characters.'),
];

const profileValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('age').isInt({ min: 18, max: 120 }).withMessage('Please provide a valid age.'),
  body('gender').trim().isIn(['Sister', 'Brother']).withMessage('Gender selection is required.'),
  body('maritalStatus').trim().notEmpty().withMessage('Marital status is required.'),
  body('country').trim().notEmpty().withMessage('Country is required.'),
  body('regionState').trim().notEmpty().withMessage('Region or state is required.'),
  body('relocation').trim().notEmpty().withMessage('Relocation preference is required.'),
  body('children').trim().notEmpty().withMessage('Children selection is required.'),
  body('aboutYourself').trim().isLength({ min: 20 }).withMessage('Please tell us about yourself.'),
  body('yearsBaptized').isInt({ min: 0, max: 100 }).withMessage('Please provide your years baptized.'),
  body('currentPrivileges').trim().notEmpty().withMessage('Current privileges are required.'),
  body('hoursPerMonth').isInt({ min: 0, max: 1000 }).withMessage('Please provide your average hours per month.'),
  body('spiritualGoals').trim().isLength({ min: 20 }).withMessage('Please describe your spiritual goals.'),
  body('qualities').optional().isArray().withMessage('Qualities must be an array.'),
];

app.post('/api/contact', contactValidators, handleValidationErrors, async (req, res) => {
  const payload = {
    firstName: normalizeText(req.body.firstName),
    country: normalizeText(req.body.country),
    email: normalizeText(req.body.email),
    subject: normalizeText(req.body.subject),
    message: normalizeText(req.body.message),
  };

  try {
    await appendSubmission('contact', payload);

    if (mailTransporter) {
      await sendNotificationEmail(
        `[JW Courtship Advisory] New contact enquiry: ${payload.subject}`,
        `New contact enquiry received:\n\nName: ${payload.firstName}\nEmail: ${payload.email}\nCountry: ${payload.country}\nSubject: ${payload.subject}\n\nMessage:\n${payload.message}`
      );
    }

    res.json({ success: true, message: 'Your message was received. We will contact you shortly.' });
  } catch (error) {
    console.error('Contact submission failed:', error);
    res.status(500).json({ success: false, error: 'Unable to submit your enquiry at this time.' });
  }
});

app.post('/api/profile', profileValidators, handleValidationErrors, async (req, res) => {
  const payload = {
    firstName: normalizeText(req.body.firstName),
    lastName: normalizeText(req.body.lastName),
    age: Number(req.body.age),
    gender: normalizeText(req.body.gender),
    maritalStatus: normalizeText(req.body.maritalStatus),
    country: normalizeText(req.body.country),
    regionState: normalizeText(req.body.regionState),
    relocation: normalizeText(req.body.relocation),
    children: normalizeText(req.body.children),
    aboutYourself: normalizeText(req.body.aboutYourself),
    yearsBaptized: Number(req.body.yearsBaptized),
    currentPrivileges: normalizeText(req.body.currentPrivileges),
    hoursPerMonth: Number(req.body.hoursPerMonth),
    spiritualGoals: normalizeText(req.body.spiritualGoals),
    qualities: Array.isArray(req.body.qualities) ? req.body.qualities.map(normalizeText) : [],
  };

  try {
    await appendSubmission('profile', payload);

    if (mailTransporter) {
      await sendNotificationEmail(
        `[JW Courtship Advisory] New profile submission from ${payload.firstName}`,
        `New profile submission received:\n\nName: ${payload.firstName} ${payload.lastName}\nAge: ${payload.age}\nGender: ${payload.gender}\nCountry: ${payload.country}\nRegion/State: ${payload.regionState}\nMarital Status: ${payload.maritalStatus}\nRelocation: ${payload.relocation}\nChildren: ${payload.children}\nHours/Month: ${payload.hoursPerMonth}\nCurrent Privileges: ${payload.currentPrivileges}\n\nAbout Yourself:\n${payload.aboutYourself}\n\nSpiritual Goals:\n${payload.spiritualGoals}\n\nQualities:\n${payload.qualities.join(', ')}`
      );
    }

    res.json({ success: true, message: 'Your profile has been saved successfully.' });
  } catch (error) {
    console.error('Profile submission failed:', error);
    res.status(500).json({ success: false, error: 'Unable to save your profile at this time.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'miles.html'));
});

app.use(express.static(path.join(__dirname)));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
