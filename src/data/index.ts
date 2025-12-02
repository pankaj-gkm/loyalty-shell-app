export enum StoreIdentifier {
  HT = "ht-kstore-india",
  TIMES = "times-now-kstore-india",
}

const { HT, TIMES } = StoreIdentifier;

export function isValidStoreIdentifier(
  identifier?: unknown
): identifier is StoreIdentifier {
  if (typeof identifier !== "string") return false;
  return Object.values(StoreIdentifier).includes(identifier as StoreIdentifier);
}

export enum BaseUrl {
  KSTORE = "https://stage.kstore.global",
  LOYALTY = "https://loyalty.kgen.global",
}

export const ProductIds: Partial<Record<StoreIdentifier, string[]>> = {
  [StoreIdentifier.HT]: ["ht-news"],
};

type TConfig = {
  clientId: string;
  clientSecret: string;
  continueCtaTitle: string;
  continueCtaUrl: string;
  orderHistoryRedirectionUrl: string;
};

export const CLIENT_ID_MAP: Record<StoreIdentifier, TConfig> = {
  [HT]: {
    clientId: "209cbe38-abf2-4673-8c86-f1be4942eacc",
    clientSecret: "f3mm1OKppwdfd7Wtu2F8YMCwlOWOXH680kPmEzP02d",
    continueCtaTitle: "Continue Reading",
    continueCtaUrl: "https://www.hindustantimes.com/sports",
    orderHistoryRedirectionUrl: "https://www.hindustantimes.com/order-history",
  },
  [TIMES]: {
    clientId: "102493df-fead-4a01-ae93-a5a7fbbadc8d",
    clientSecret: "0aRxAQe7wKaMxAvKcBDQ3DSEVu7uYxHFmP4WKJMrVkr",
    continueCtaTitle: "Continue Reading",
    continueCtaUrl: "https://www.timesnownews.com/",
    orderHistoryRedirectionUrl: "",
  },
};

export const STORE_MAP = {
  [HT]: {
    stores: [{ label: `HT - ${HT}`, value: HT }],
    baseUrls: [{ label: `K-Store - ${BaseUrl.KSTORE}`, value: BaseUrl.KSTORE }],
    products: [{ label: "None", value: "" }].concat(
      ProductIds[StoreIdentifier.HT]?.map((id) => ({ label: id, value: id })) ||
        []
    ),
  },
  [TIMES]: {
    stores: [{ label: `Times - ${TIMES}`, value: TIMES }],
    baseUrls: [
      { label: `K-Store - ${BaseUrl.KSTORE}`, value: BaseUrl.KSTORE },
      { label: `Loyalty - ${BaseUrl.LOYALTY}`, value: BaseUrl.LOYALTY },
    ],
    products: [],
  },
};
