import { useLanguage } from '../context/language';

export const useRTL = () => {
  const { direction, isRTL, textAlign } = useLanguage();

  return {
    direction,
    isRTL,
    textAlign,
    rowDirection: isRTL ? 'row-reverse' : 'row',
    textDirectionStyle: {
      textAlign,
      writingDirection: direction,
    } as const,
  };
};
