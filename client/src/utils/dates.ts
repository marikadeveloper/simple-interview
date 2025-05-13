import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY');
};
export const formatDateTime = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};
export const formatDateRelative = (date: string) => {
  return dayjs(date).fromNow();
};
