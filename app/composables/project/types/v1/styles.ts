type TextAlignT = 'left' | 'center' | 'right';

export type ScoreStyles = {
  scoreText: string;
  scoreTextAlign: TextAlignT;
  scoreTextColor: string;
  scoreTextSize: number;
};

export type AddonStyles = {
  addonText: string;
  addonTextAlign: TextAlignT;
  addonTextColor: string;
  addonTextTextSize: number;
  addonTitle: string;
  addonTitleAlign: TextAlignT;
  addonTitleColor: string;
  addonTitleTextSize: number;
};

export type ObjStyles = ScoreStyles & {
  objectTitle: string;
  objectTitleTextSize: 200;
  objectTitleColor: string;
  objectTitleAlign: TextAlignT;

  objectText: string;
  objectTextTextSize: 100;
  objectTextAlign: TextAlignT;
  objectTextColor: string;
  objectTextPadding: 10;

  objectImageWidth: number;
  objectImageMarginTop: number;
  objectImageMarginBottom: number;

  objectBgColorIsOn: boolean;
  objectBgColor: string;
  objectBackgroundImage: string;

  objectBorderIsOn: boolean;
  objectBorderColor: string;
  objectBorderStyle: string;
  objectBorderWidth: number;
  objectBorderRadiusTopLeft: string | number;
  objectBorderRadiusTopRight: string | number;
  objectBorderRadiusBottomRight: string | number;
  objectBorderRadiusBottomLeft: string | number;
  objectBorderRadiusIsPixels: boolean;

  objectImgBorderColor: string;
  objectImgBorderIsOn: boolean;
  objectImgFillIsOn: boolean;
  objectImgObjectFillStyle: string;
  objectImgObjectFillHeight: string;
  objectImgOverflowIsOn: boolean;

  objectMargin: number;
  objectHeight: boolean;
  objectOverflowIsOn: boolean;

  selBgColorIsOn: boolean;
  selFilterBgColor: string;

  reqBgColorIsOn: boolean;
  reqFilterBgColor: string;
};

export type RowStyles = ObjStyles &
  AddonStyles & {
    rowTitle: string;
    rowTitleColor: string;
    rowTitleAlign: TextAlignT;
    rowTitleTextSize: number;

    rowText: string;
    rowTextColor: string;
    rowTextAlign: TextAlignT;
    rowTextPaddingX: number;
    rowTextPaddingY: number;
    rowTextTextSize: number;

    rowBgColor: string;
    rowBgColorIsOn: boolean;
    rowBackgroundImage: string;

    rowBodyMarginBottom: number | string;
    rowBodyMarginSides: number | string;
    rowBodyMarginTop: number | string;

    rowBorderColor: string;
    rowBorderIsOn: boolean;
    rowBorderStyle: string;
    rowBorderWidth: number;
    rowOverFlowIsOn: boolean;
    rowBorderRadiusTopLeft: string | number;
    rowBorderRadiusTopRight: string | number;
    rowBorderRadiusBottomRight: string | number;
    rowBorderRadiusBottomLeft: string | number;
    rowBorderRadiusIsPixels: boolean;

    rowImageMarginTop: number;
    rowImageMarginBottom: number;
    rowImageWidth: number;
    rowImgBorderColor: string;
    rowImgBorderIsOn: boolean;
    rowImgBorderStyle: string;
    rowImgBorderWidth: number;
    rowImgOverflowIsOn: boolean;

    rowMargin: number;
  };

export type BarStyles = {
  barTextFont: string;
};

export type ProjectStyles = RowStyles &
  BarStyles & {
    backgroundColor: string;
  };
