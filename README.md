# Lynto

Lynto is a mobile-first healthcare application designed for care agencies to monitor client wellbeing. Carers record observations during visits—including symptoms, vital signs, and notes—which are automatically scored to identify health risks. Managers receive real-time alerts for amber and red risk levels, enabling prompt intervention and coordinated care responses.

## Features

- **Visit Entry System**: Carers log symptoms, vitals (temperature, pulse, blood pressure, oxygen saturation, respiratory rate), and observations
- **Risk Assessment**: Automatic scoring algorithm classifies visits as green (stable), amber (caution), or red (urgent)
- **Alert Management**: Managers review alerts, document actions taken (monitor, contact family, inform GP, escalate to emergency services)
- **Client Management**: Track clients with internal references, manage active/inactive status
- **Carer Management**: Assign clients to carers, manage carer status and workload
- **Entry History**: Full audit trail of all visit entries with correction notes capability

## Tech Stack

- React 19 with TypeScript
- Vite for development and builds
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
