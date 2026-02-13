import { format, formatDistance, formatRelative } from 'date-fns';

// Format date
export const formatDate = (date: string | Date, formatStr = 'PPP'): string => {
  return format(new Date(date), formatStr);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

// Get exam label
export const getExamLabel = (examType: string): string => {
  const examMap: Record<string, string> = {
    SSC_CGL: 'SSC CGL',
    SSC_CHSL: 'SSC CHSL',
    RAILWAYS_NTPC: 'Railways NTPC',
    RAILWAYS_GROUP_D: 'Railways Group D',
    IBPS_PO: 'IBPS PO',
    SBI_CLERK: 'SBI Clerk',
    STATE_PSC: 'State PSC',
    DEFENSE: 'Defense',
    TEACHING: 'Teaching',
    OTHER: 'Other',
  };
  return examMap[examType] || examType;
};

// Get subject label
export const getSubjectLabel = (subject: string): string => {
  return subject
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};
