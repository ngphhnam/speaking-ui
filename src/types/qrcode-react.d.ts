declare module "qrcode.react" {
  import * as React from "react";

  export interface QRCodeProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    level?: "L" | "M" | "Q" | "H";
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height?: number;
      width?: number;
      excavate?: boolean;
    };
  }

  export const QRCodeSVG: React.FC<QRCodeProps>;
  export const QRCodeCanvas: React.FC<QRCodeProps>;
}

