import type { CSSProperties } from 'react';
import { LOGO_ALT, LOGO_SRC } from '../constants/brand';

type BrandLogoProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
};

export default function BrandLogo({ size = 32, className, style, alt = LOGO_ALT }: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'block', ...style }}
    />
  );
}
